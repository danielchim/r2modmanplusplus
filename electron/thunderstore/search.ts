/**
 * Thunderstore package search and caching orchestration
 */
import { fetchGzipJson } from "./blob"
import { loadCache, saveCache } from "./cache"
import { transformPackages } from "./transform"
import type { ThunderstorePackage, PackageListingIndex, PackageListingChunk } from "./types"
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
 * Ensures a community's packages are cached and up-to-date
 * 
 * @param packageIndexUrl - URL to the package listing index
 * @returns Array of all packages for this community
 */
export async function ensureCommunityCached(packageIndexUrl: string): Promise<ThunderstorePackage[]> {
  // Step 1: Fetch the package index to get chunk URLs
  const indexResult = await fetchGzipJson<PackageListingIndex>(packageIndexUrl)
  const chunkUrls = indexResult.content
  const indexHash = indexResult.hash

  // Step 2: Check if we have a valid cache
  const cached = await loadCache(packageIndexUrl)
  
  if (cached && cached.indexHash === indexHash) {
    console.log(`Using cached packages for ${packageIndexUrl} (${cached.packages.length} packages)`)
    return cached.packages
  }

  // Step 3: Cache is missing or stale - fetch all chunks
  console.log(`Fetching ${chunkUrls.length} chunks for ${packageIndexUrl}`)
  
  const chunkPromises = chunkUrls.map(url => fetchGzipJson<PackageListingChunk>(url))
  const chunkResults = await Promise.all(chunkPromises)
  
  // Step 4: Merge all chunks into a single package array
  const allPackages: ThunderstorePackage[] = []
  for (const result of chunkResults) {
    allPackages.push(...result.content)
  }

  console.log(`Fetched ${allPackages.length} packages for ${packageIndexUrl}`)

  // Step 5: Save to cache
  await saveCache(packageIndexUrl, allPackages, indexHash)

  return allPackages
}

/**
 * Searches packages with filtering, sorting, and pagination
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

  // Step 1: Ensure packages are cached
  const packages = await ensureCommunityCached(packageIndexUrl)

  // Step 2: Filter packages
  let filtered = packages.filter(pkg => {
    // Skip deprecated packages
    if (pkg.is_deprecated) return false

    // Skip packages with no versions
    if (pkg.versions.length === 0) return false

    // Filter by section (mod vs modpack)
    if (section === "modpack") {
      const hasModpackCategory = pkg.categories.some(cat => cat.toLowerCase() === "modpacks")
      if (!hasModpackCategory) return false
    } else if (section === "mod") {
      const hasModpackCategory = pkg.categories.some(cat => cat.toLowerCase() === "modpacks")
      if (hasModpackCategory) return false
    }

    // Filter by search query
    if (query) {
      const searchLower = query.toLowerCase()
      return pkg.name.toLowerCase().includes(searchLower)
    }

    return true
  })

  // Step 3: Sort packages
  filtered.sort((a, b) => {
    switch (sort) {
      case "name":
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      
      case "downloads": {
        const aDownloads = a.versions[0]?.downloads || 0
        const bDownloads = b.versions[0]?.downloads || 0
        return bDownloads - aDownloads // Descending
      }
      
      case "updated":
      default: {
        const aDate = new Date(a.date_updated).getTime()
        const bDate = new Date(b.date_updated).getTime()
        return bDate - aDate // Descending (newest first)
      }
    }
  })

  // Step 4: Paginate
  const total = filtered.length
  const start = cursor
  const end = start + limit
  const page = filtered.slice(start, end)

  // Step 5: Transform to Mod format
  const items = transformPackages(page, gameId)

  // Step 6: Calculate next cursor
  const nextCursor = end < total ? end : null

  return {
    items,
    nextCursor,
    total,
  }
}

/**
 * Gets a single package by its UUID
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
  const packages = await ensureCommunityCached(packageIndexUrl)
  const pkg = packages.find(p => p.uuid4 === uuid4)
  
  if (!pkg || pkg.versions.length === 0) {
    return null
  }

  const [mod] = transformPackages([pkg], gameId)
  return mod || null
}
