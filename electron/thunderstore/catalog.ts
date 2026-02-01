/**
 * Thunderstore package catalog backed by SQLite
 * Provides bounded-memory package indexing and querying
 */
import Database from "better-sqlite3"
import { app } from "electron"
import { join } from "path"
import { promises as fs } from "fs"
import { createHash } from "crypto"
import { fetchGzipJson } from "./blob"
import type { ThunderstorePackage, PackageListingIndex, PackageListingChunk } from "./types"
import { getLogger } from "../file-logger"

/**
 * Search parameters for catalog queries
 */
export interface CatalogSearchParams {
  query?: string
  section?: "all" | "mod" | "modpack"
  sort?: "name" | "downloads" | "updated"
  offset?: number
  limit?: number
}

/**
 * Result of a catalog search
 */
export interface CatalogSearchResult {
  packages: ThunderstorePackage[]
  total: number
  hasMore: boolean
}

/**
 * Catalog metadata
 */
interface CatalogMetadata {
  packageIndexUrl: string
  indexHash: string
  packageCount: number
  updatedAt: string
}

/**
 * Maximum number of chunks to fetch/process concurrently
 * Prevents OOM by limiting peak memory during catalog builds
 */
const MAX_CHUNK_CONCURRENCY = 3

/**
 * Gets the catalog directory path
 */
function getCatalogDir(): string {
  return join(app.getPath("userData"), "thunderstore-catalog")
}

/**
 * Generates a safe DB filename from packageIndexUrl
 */
function getCatalogKey(packageIndexUrl: string): string {
  return createHash("sha256").update(packageIndexUrl).digest("hex").substring(0, 16)
}

/**
 * Gets the DB file path for a specific community
 */
function getDbPath(packageIndexUrl: string): string {
  const key = getCatalogKey(packageIndexUrl)
  return join(getCatalogDir(), `${key}.db`)
}

/**
 * Ensures the catalog directory exists
 */
async function ensureCatalogDir(): Promise<void> {
  const dir = getCatalogDir()
  await fs.mkdir(dir, { recursive: true })
}

/**
 * In-memory cache of open database connections
 * Key: packageIndexUrl, Value: Database instance
 */
const dbCache = new Map<string, Database.Database>()

/**
 * Gets or creates a database connection for a community
 */
function getDb(packageIndexUrl: string): Database.Database {
  const cached = dbCache.get(packageIndexUrl)
  if (cached) {
    return cached
  }

  const dbPath = getDbPath(packageIndexUrl)
  let db: Database.Database
  try {
    db = new Database(dbPath)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    getLogger().error(`[Catalog] Failed to open SQLite DB at ${dbPath}: ${message}`)
    throw error
  }
  
  // Enable WAL mode for better concurrency
  db.pragma("journal_mode = WAL")
  
  // Initialize schema
  initSchema(db)
  
  dbCache.set(packageIndexUrl, db)
  return db
}

/**
 * Initializes the database schema
 */
function initSchema(db: Database.Database): void {
  db.exec(`
    -- Catalog metadata (single row)
    CREATE TABLE IF NOT EXISTS metadata (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      package_index_url TEXT NOT NULL,
      index_hash TEXT NOT NULL,
      package_count INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    -- Package table (one row per package)
    CREATE TABLE IF NOT EXISTS packages (
      uuid4 TEXT PRIMARY KEY,
      owner TEXT NOT NULL,
      name TEXT NOT NULL,
      full_name TEXT NOT NULL,
      date_updated TEXT NOT NULL,
      is_deprecated INTEGER NOT NULL DEFAULT 0,
      categories TEXT NOT NULL, -- JSON array
      
      -- Latest version fields (denormalized for fast search/display)
      latest_version TEXT NOT NULL,
      latest_description TEXT NOT NULL,
      latest_downloads INTEGER NOT NULL DEFAULT 0,
      latest_icon TEXT NOT NULL,
      latest_dependencies TEXT NOT NULL, -- JSON array
      
      -- Full versions array (all versions for this package)
      versions_json TEXT NOT NULL -- JSON array of ThunderstorePackageVersion
    );

    -- Indexes for common queries
    CREATE INDEX IF NOT EXISTS idx_packages_owner_name ON packages(owner, name);
    CREATE INDEX IF NOT EXISTS idx_packages_name ON packages(name COLLATE NOCASE);
    CREATE INDEX IF NOT EXISTS idx_packages_date_updated ON packages(date_updated DESC, uuid4);
    CREATE INDEX IF NOT EXISTS idx_packages_downloads ON packages(latest_downloads DESC, uuid4);
    CREATE INDEX IF NOT EXISTS idx_packages_deprecated ON packages(is_deprecated);
  `)
}

/**
 * Gets catalog metadata
 */
function getMetadata(db: Database.Database): CatalogMetadata | null {
  const stmt = db.prepare<[], CatalogMetadata>("SELECT package_index_url as packageIndexUrl, index_hash as indexHash, package_count as packageCount, updated_at as updatedAt FROM metadata WHERE id = 1")
  return stmt.get() || null
}

/**
 * Sets catalog metadata
 */
function setMetadata(db: Database.Database, metadata: Omit<CatalogMetadata, "packageCount">): void {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO metadata (id, package_index_url, index_hash, package_count, updated_at)
    VALUES (1, ?, ?, 0, ?)
  `)
  stmt.run(metadata.packageIndexUrl, metadata.indexHash, metadata.updatedAt)
}

/**
 * Inserts or updates a package in the catalog
 */
function upsertPackage(db: Database.Database, pkg: ThunderstorePackage): void {
  if (pkg.versions.length === 0) {
    // Skip packages with no versions
    return
  }

  const latestVersion = pkg.versions[0]
  
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO packages (
      uuid4, owner, name, full_name, date_updated, is_deprecated, categories,
      latest_version, latest_description, latest_downloads, latest_icon, latest_dependencies,
      versions_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  
  stmt.run(
    pkg.uuid4,
    pkg.owner,
    pkg.name,
    pkg.full_name,
    pkg.date_updated,
    pkg.is_deprecated ? 1 : 0,
    JSON.stringify(pkg.categories),
    latestVersion.version_number,
    latestVersion.description,
    latestVersion.downloads,
    latestVersion.icon,
    JSON.stringify(latestVersion.dependencies),
    JSON.stringify(pkg.versions)
  )
}

/**
 * Updates package count in metadata
 */
function updatePackageCount(db: Database.Database): void {
  db.prepare("UPDATE metadata SET package_count = (SELECT COUNT(*) FROM packages) WHERE id = 1").run()
}

/**
 * Fetches chunks with concurrency limit to bound peak memory
 */
async function fetchChunksIteratively(chunkUrls: string[]): Promise<ThunderstorePackage[]> {
  const logger = getLogger()
  const allPackages: ThunderstorePackage[] = []
  const startTime = Date.now()
  
  // Process chunks in batches of MAX_CHUNK_CONCURRENCY
  for (let i = 0; i < chunkUrls.length; i += MAX_CHUNK_CONCURRENCY) {
    const batch = chunkUrls.slice(i, i + MAX_CHUNK_CONCURRENCY)
    const batchNumber = Math.floor(i / MAX_CHUNK_CONCURRENCY) + 1
    const totalBatches = Math.ceil(chunkUrls.length / MAX_CHUNK_CONCURRENCY)
    
    const batchStartTime = Date.now()
    logger.debug(`[Catalog] Fetching chunk batch ${batchNumber}/${totalBatches} (${batch.length} chunks)`)
    
    const batchPromises = batch.map(url => fetchGzipJson<PackageListingChunk>(url))
    const batchResults = await Promise.all(batchPromises)
    
    let batchPackageCount = 0
    for (const result of batchResults) {
      batchPackageCount += result.content.length
      allPackages.push(...result.content)
    }
    
    const batchElapsedMs = Date.now() - batchStartTime
    const batchElapsedSec = (batchElapsedMs / 1000).toFixed(1)
    logger.debug(`[Catalog]   ✓ Batch ${batchNumber} complete: +${batchPackageCount} packages (${batchElapsedSec}s) | Total: ${allPackages.length}`)
  }
  
  const totalElapsedSec = ((Date.now() - startTime) / 1000).toFixed(1)
  logger.info(`[Catalog] All chunks fetched in ${totalElapsedSec}s: ${allPackages.length} packages total`)
  
  return allPackages
}

/**
 * Builds catalog from Thunderstore chunks
 */
async function buildCatalog(db: Database.Database, packageIndexUrl: string): Promise<void> {
  const logger = getLogger()
  logger.info(`[Catalog] Building catalog for ${packageIndexUrl}`)
  
  // Fetch the package index to get chunk URLs
  const indexResult = await fetchGzipJson<PackageListingIndex>(packageIndexUrl)
  const chunkUrls = indexResult.content
  
  logger.info(`[Catalog] Found ${chunkUrls.length} chunks to process with concurrency limit of ${MAX_CHUNK_CONCURRENCY}`)
  
  // Fetch chunks with bounded concurrency
  const packages = await fetchChunksIteratively(chunkUrls)
  
  logger.info(`[Catalog] Fetched ${packages.length} packages total, inserting into SQLite DB...`)
  
  // Insert packages in a transaction for speed
  const insertTx = db.transaction((packages: ThunderstorePackage[]) => {
    let inserted = 0
    for (const pkg of packages) {
      upsertPackage(db, pkg)
      inserted++
      if (inserted % 5000 === 0) {
        logger.debug(`[Catalog]   Inserted ${inserted}/${packages.length} packages...`)
      }
    }
    updatePackageCount(db)
  })
  
  insertTx(packages)
  
  const finalMeta = getMetadata(db)
  logger.info(`[Catalog] Build complete! ${finalMeta?.packageCount || packages.length} packages indexed.`)
}

/**
 * Ensures catalog is up-to-date for a community
 * Rebuilds if index hash has changed or catalog doesn't exist
 */
export async function ensureCatalogUpToDate(packageIndexUrl: string): Promise<void> {
  const logger = getLogger()
  logger.debug(`[Catalog] Ensuring catalog up-to-date for ${packageIndexUrl}`)

  try {
    await ensureCatalogDir()

    const db = getDb(packageIndexUrl)

    // Fetch current index hash
    logger.debug(`[Catalog] Fetching package index to check for updates...`)
    const indexResult = await fetchGzipJson<PackageListingIndex>(packageIndexUrl)
    const currentIndexHash = indexResult.hash

    // Check existing metadata
    const metadata = getMetadata(db)

    if (metadata && metadata.indexHash === currentIndexHash) {
      logger.debug(`[Catalog] Catalog up-to-date (${metadata.packageCount} packages, hash: ${currentIndexHash.substring(0, 8)})`)
      return
    }

    // Catalog is stale or missing - rebuild
    if (metadata) {
      logger.info(`[Catalog] Catalog stale (old hash: ${metadata.indexHash.substring(0, 8)}, new hash: ${currentIndexHash.substring(0, 8)}), rebuilding...`)
    } else {
      logger.info(`[Catalog] No catalog found, building from scratch...`)
    }

    // Clear existing data
    db.exec("DELETE FROM packages")

    // Set metadata
    setMetadata(db, {
      packageIndexUrl,
      indexHash: currentIndexHash,
      updatedAt: new Date().toISOString(),
    })

    // Build catalog
    await buildCatalog(db, packageIndexUrl)

    logger.info(`[Catalog] Catalog ready!`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error(`[Catalog] Failed to ensure catalog: ${message}`)
    throw error
  }
}

/**
 * Searches packages in the catalog
 */
export function searchPackages(packageIndexUrl: string, params: CatalogSearchParams): CatalogSearchResult {
  const logger = getLogger()
  const startTime = Date.now()
  const db = getDb(packageIndexUrl)
  const { query, section = "all", sort = "updated", offset = 0, limit = 20 } = params
  
  logger.debug(`[Catalog] Search query: "${query || "(none)"}", section: ${section}, sort: ${sort}, offset: ${offset}, limit: ${limit}`)
  
  // Build WHERE clause
  const conditions: string[] = ["is_deprecated = 0"]
  const queryParams: unknown[] = []
  
  // Section filter (mod vs modpack)
  if (section === "modpack") {
    conditions.push("categories LIKE '%\"modpacks\"%' COLLATE NOCASE")
  } else if (section === "mod") {
    conditions.push("categories NOT LIKE '%\"modpacks\"%' COLLATE NOCASE")
  }
  
  // Search filter
  if (query && query.trim()) {
    conditions.push("(name LIKE ? COLLATE NOCASE OR owner LIKE ? COLLATE NOCASE)")
    const searchPattern = `%${query.trim()}%`
    queryParams.push(searchPattern, searchPattern)
  }
  
  const whereClause = conditions.join(" AND ")
  
  // Build ORDER BY clause
  let orderBy: string
  switch (sort) {
    case "name":
      orderBy = "name COLLATE NOCASE ASC, uuid4 ASC"
      break
    case "downloads":
      orderBy = "latest_downloads DESC, uuid4 ASC"
      break
    case "updated":
    default:
      orderBy = "date_updated DESC, uuid4 ASC"
      break
  }
  
  // Get total count
  const countStmt = db.prepare<unknown[], { total: number }>(`SELECT COUNT(*) as total FROM packages WHERE ${whereClause}`)
  const countResult = countStmt.get(...queryParams)
  const total = countResult?.total || 0
  
  // Get page of results
  queryParams.push(limit, offset)
  const selectStmt = db.prepare(`
    SELECT 
      uuid4, owner, name, full_name as fullName, date_updated as dateUpdated,
      is_deprecated as isDeprecated, categories, latest_version as latestVersion,
      latest_description as latestDescription, latest_downloads as latestDownloads,
      latest_icon as latestIcon, latest_dependencies as latestDependencies,
      versions_json as versionsJson
    FROM packages
    WHERE ${whereClause}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `)
  
  const rows = selectStmt.all(...queryParams) as Array<{
    uuid4: string
    owner: string
    name: string
    fullName: string
    dateUpdated: string
    isDeprecated: number
    categories: string
    latestVersion: string
    latestDescription: string
    latestDownloads: number
    latestIcon: string
    latestDependencies: string
    versionsJson: string
  }>
  
  // Transform rows to ThunderstorePackage format
  const packages: ThunderstorePackage[] = rows.map(row => ({
    uuid4: row.uuid4,
    owner: row.owner,
    name: row.name,
    full_name: row.fullName,
    date_updated: row.dateUpdated,
    date_created: row.dateUpdated, // Not stored separately
    is_deprecated: row.isDeprecated === 1,
    is_pinned: false, // Not used
    has_nsfw_content: false, // Not used
    categories: JSON.parse(row.categories),
    rating_score: 0, // Not used
    package_url: "", // Not used
    donation_link: null,
    versions: JSON.parse(row.versionsJson),
  }))
  
  const hasMore = offset + limit < total
  
  const elapsedMs = Date.now() - startTime
  logger.debug(`[Catalog] Search complete in ${elapsedMs}ms: ${packages.length} results (${total} total matches)`)
  
  return {
    packages,
    total,
    hasMore,
  }
}

/**
 * Gets a single package by UUID
 */
export function getPackageByUuid(packageIndexUrl: string, uuid4: string): ThunderstorePackage | null {
  const logger = getLogger()
  const startTime = Date.now()
  logger.debug(`[Catalog] Looking up package by UUID: ${uuid4}`)
  const db = getDb(packageIndexUrl)
  
  const stmt = db.prepare(`
    SELECT 
      uuid4, owner, name, full_name as fullName, date_updated as dateUpdated,
      is_deprecated as isDeprecated, categories, latest_version as latestVersion,
      latest_description as latestDescription, latest_downloads as latestDownloads,
      latest_icon as latestIcon, latest_dependencies as latestDependencies,
      versions_json as versionsJson
    FROM packages
    WHERE uuid4 = ?
  `)
  
  const row = stmt.get(uuid4) as {
    uuid4: string
    owner: string
    name: string
    fullName: string
    dateUpdated: string
    isDeprecated: number
    categories: string
    latestVersion: string
    latestDescription: string
    latestDownloads: number
    latestIcon: string
    latestDependencies: string
    versionsJson: string
  } | undefined
  
  const elapsedMs = Date.now() - startTime
  
  if (!row) {
    logger.debug(`[Catalog] Package not found (${elapsedMs}ms): ${uuid4}`)
    return null
  }
  
  logger.debug(`[Catalog] Package found (${elapsedMs}ms): ${row.name} by ${row.owner}`)
  
  return {
    uuid4: row.uuid4,
    owner: row.owner,
    name: row.name,
    full_name: row.fullName,
    date_updated: row.dateUpdated,
    date_created: row.dateUpdated,
    is_deprecated: row.isDeprecated === 1,
    is_pinned: false,
    has_nsfw_content: false,
    categories: JSON.parse(row.categories),
    rating_score: 0,
    package_url: "",
    donation_link: null,
    versions: JSON.parse(row.versionsJson),
  }
}

/**
 * Resolves packages by owner-name keys
 * Used for dependency resolution
 */
export function resolvePackagesByOwnerName(
  packageIndexUrl: string,
  keys: string[]
): Map<string, ThunderstorePackage> {
  const logger = getLogger()
  const startTime = Date.now()
  logger.debug(`[Catalog] Resolving ${keys.length} dependencies by owner-name`)
  const db = getDb(packageIndexUrl)
  const result = new Map<string, ThunderstorePackage>()
  
  if (keys.length === 0) {
    logger.debug(`[Catalog] No dependencies to resolve`)
    return result
  }
  
  // Build placeholders for IN clause
  const placeholders = keys.map(() => "?").join(",")
  
  const stmt = db.prepare(`
    SELECT 
      uuid4, owner, name, full_name as fullName, date_updated as dateUpdated,
      is_deprecated as isDeprecated, categories, latest_version as latestVersion,
      latest_description as latestDescription, latest_downloads as latestDownloads,
      latest_icon as latestIcon, latest_dependencies as latestDependencies,
      versions_json as versionsJson
    FROM packages
    WHERE (owner || '-' || name) IN (${placeholders})
  `)
  
  const rows = stmt.all(...keys) as Array<{
    uuid4: string
    owner: string
    name: string
    fullName: string
    dateUpdated: string
    isDeprecated: number
    categories: string
    latestVersion: string
    latestDescription: string
    latestDownloads: number
    latestIcon: string
    latestDependencies: string
    versionsJson: string
  }>
  
  for (const row of rows) {
    const key = `${row.owner}-${row.name}`
    const pkg: ThunderstorePackage = {
      uuid4: row.uuid4,
      owner: row.owner,
      name: row.name,
      full_name: row.fullName,
      date_updated: row.dateUpdated,
      date_created: row.dateUpdated,
      is_deprecated: row.isDeprecated === 1,
      is_pinned: false,
      has_nsfw_content: false,
      categories: JSON.parse(row.categories),
      rating_score: 0,
      package_url: "",
      donation_link: null,
      versions: JSON.parse(row.versionsJson),
    }
    result.set(key, pkg)
  }
  
  const elapsedMs = Date.now() - startTime
  logger.debug(`[Catalog] Resolved ${result.size}/${keys.length} dependencies in ${elapsedMs}ms`)
  
  return result
}

/**
 * Result of a category query
 */
export interface CategoriesResult {
  categories: string[]
  counts: Record<string, number>
}

/**
 * Gets unique categories from the catalog with counts
 * Uses SQLite JSON functions to efficiently extract categories without full-table scan
 */
export function getCategories(packageIndexUrl: string, section: "all" | "mod" | "modpack" = "all"): CategoriesResult {
  const logger = getLogger()
  const startTime = Date.now()
  const db = getDb(packageIndexUrl)
  
  logger.debug(`[Catalog] Fetching categories for section: ${section}`)
  
  // Build WHERE clause for section filtering
  const conditions: string[] = ["is_deprecated = 0"]
  
  if (section === "modpack") {
    conditions.push("categories LIKE '%\"modpacks\"%' COLLATE NOCASE")
  } else if (section === "mod") {
    conditions.push("categories NOT LIKE '%\"modpacks\"%' COLLATE NOCASE")
  }
  
  const whereClause = conditions.join(" AND ")
  
  // Use SQLite's JSON1 extension to explode categories array and count packages per category
  // This avoids parsing JSON in JS and is much faster
  const stmt = db.prepare<[], { category: string; count: number }>(`
    SELECT 
      TRIM(value, '"') as category,
      COUNT(DISTINCT uuid4) as count
    FROM packages, json_each(packages.categories)
    WHERE ${whereClause}
    GROUP BY category
    ORDER BY category COLLATE NOCASE
  `)
  
  const rows = stmt.all()
  
  const categories: string[] = []
  const counts: Record<string, number> = {}
  
  for (const row of rows) {
    categories.push(row.category)
    counts[row.category] = row.count
  }
  
  const elapsedMs = Date.now() - startTime
  logger.debug(`[Catalog] Found ${categories.length} categories in ${elapsedMs}ms`)
  
  return {
    categories,
    counts,
  }
}

/**
 * Clears catalog for a community
 */
export async function clearCatalog(packageIndexUrl: string): Promise<void> {
  const db = dbCache.get(packageIndexUrl)
  if (db) {
    db.close()
    dbCache.delete(packageIndexUrl)
  }
  
  const dbPath = getDbPath(packageIndexUrl)
  try {
    await fs.unlink(dbPath)
    await fs.unlink(dbPath + "-wal")
    await fs.unlink(dbPath + "-shm")
  } catch {
    // Files might not exist, ignore
  }
}

/**
 * Closes all open database connections
 * Should be called on app shutdown
 */
export function closeAllCatalogs(): void {
  for (const db of dbCache.values()) {
    db.close()
  }
  dbCache.clear()
}
