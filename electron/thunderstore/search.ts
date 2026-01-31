/**
 * Thunderstore package search and caching orchestration
 */
import { ensureCatalogUpToDate, searchPackages as catalogSearch, getPackageByUuid } from "./catalog"
import { transformPackages } from "./transform"
import type { Mod } from "../../src/types/mod"

/**
 * Search parameters for filtering/sorting packages
 */
export interface SearchParams {
  packageIndexUrl: string
  gameId: string
  query?: string
  section?: "all" | "mod" | "modpack"
  sort?: "name" | "downloads" | "updated"
  cursor?: number
  limit?: number
}

/**
 * Paginated search results
 */
export interface SearchResult {
  items: Mod[]
  nextCursor: number | null
  total: number
}

/**
 * Ensures a community's catalog is up-to-date
 * DEPRECATED: Use catalog directly via ensureCatalogUpToDate + catalog queries
 * Kept for backward compatibility but no longer loads full array into memory
 * 
 * @param packageIndexUrl - URL to the package listing index
 */
export async function ensureCommunityCached(packageIndexUrl: string): Promise<void> {
  await ensureCatalogUpToDate(packageIndexUrl)
}

/**
 * Searches packages with filtering, sorting, and pagination
 * Now uses SQLite catalog for bounded-memory operation
 * 
 * @param params - Search parameters
 * @returns Paginated search results
 */
export async function searchPackages(params: SearchParams): Promise<SearchResult> {
  const {
    packageIndexUrl,
    gameId,
    query = "",
    section = "all",
    sort = "updated",
    cursor = 0,
    limit = 20,
  } = params

  // Step 1: Ensure catalog is up-to-date
  await ensureCatalogUpToDate(packageIndexUrl)

  // Step 2: Query catalog (happens in SQLite, bounded memory)
  const result = catalogSearch(packageIndexUrl, {
    query,
    section,
    sort,
    offset: cursor,
    limit,
  })

  // Step 3: Transform to Mod format
  const items = transformPackages(result.packages, gameId)

  // Step 4: Calculate next cursor
  const nextCursor = result.hasMore ? cursor + limit : null

  return {
    items,
    nextCursor,
    total: result.total,
  }
}

/**
 * Gets a single package by its UUID
 * Now uses SQLite catalog for bounded-memory operation
 * 
 * @param packageIndexUrl - URL to the package listing index
 * @param gameId - Game ID to associate with this mod
 * @param uuid4 - Package UUID to find
 * @returns Mod or null if not found
 */
export async function getPackage(
  packageIndexUrl: string,
  gameId: string,
  uuid4: string
): Promise<Mod | null> {
  // Ensure catalog is up-to-date
  await ensureCatalogUpToDate(packageIndexUrl)
  
  // Query catalog
  const pkg = getPackageByUuid(packageIndexUrl, uuid4)
  
  if (!pkg || pkg.versions.length === 0) {
    return null
  }

  const [mod] = transformPackages([pkg], gameId)
  return mod || null
}
