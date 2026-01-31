/**
 * Disk cache for Thunderstore package listings
 * Stores packages per community (packageIndexUrl) under app userData
 * 
 * @deprecated This JSON cache layer is deprecated in favor of the SQLite catalog
 * (see electron/thunderstore/catalog.ts). This module is kept for backward compatibility
 * but is no longer used by the main search/dependency resolution flow.
 */
import { app } from "electron"
import { promises as fs } from "fs"
import { join } from "path"
import { createHash } from "crypto"
import type { ThunderstorePackage } from "./types"

/**
 * Cached package list metadata
 */
export interface CachedPackageList {
  packages: ThunderstorePackage[]
  packageIndexUrl: string
  indexHash: string
  cachedAt: Date
}

/**
 * Generates a safe cache key from a packageIndexUrl
 */
function getCacheKey(packageIndexUrl: string): string {
  return createHash("sha256").update(packageIndexUrl).digest("hex").substring(0, 16)
}

/**
 * Gets the cache directory path for Thunderstore data
 */
function getCacheDir(): string {
  return join(app.getPath("userData"), "thunderstore-cache")
}

/**
 * Gets the cache file path for a specific community
 */
function getCacheFilePath(cacheKey: string): string {
  return join(getCacheDir(), `${cacheKey}.json`)
}

/**
 * Ensures the cache directory exists
 */
async function ensureCacheDir(): Promise<void> {
  const dir = getCacheDir()
  try {
    await fs.mkdir(dir, { recursive: true })
  } catch (error) {
    // Directory might already exist, ignore
  }
}

/**
 * Loads cached package list from disk
 * 
 * @param packageIndexUrl - The package index URL (used to derive cache key)
 * @returns Cached package list or null if not found/invalid
 */
export async function loadCache(packageIndexUrl: string): Promise<CachedPackageList | null> {
  const cacheKey = getCacheKey(packageIndexUrl)
  const filePath = getCacheFilePath(cacheKey)

  try {
    const content = await fs.readFile(filePath, "utf-8")
    const data = JSON.parse(content) as CachedPackageList
    
    // Validate structure
    if (!Array.isArray(data.packages) || !data.packageIndexUrl || !data.indexHash) {
      console.warn(`Invalid cache structure for ${cacheKey}`)
      return null
    }

    // Convert cachedAt string back to Date
    data.cachedAt = new Date(data.cachedAt)

    return data
  } catch (error) {
    // File doesn't exist or is invalid
    return null
  }
}

/**
 * Saves package list to disk cache
 * 
 * @param packageIndexUrl - The package index URL
 * @param packages - The packages to cache
 * @param indexHash - Hash of the package index for cache invalidation
 */
export async function saveCache(
  packageIndexUrl: string,
  packages: ThunderstorePackage[],
  indexHash: string
): Promise<void> {
  await ensureCacheDir()

  const cacheKey = getCacheKey(packageIndexUrl)
  const filePath = getCacheFilePath(cacheKey)

  const data: CachedPackageList = {
    packages,
    packageIndexUrl,
    indexHash,
    cachedAt: new Date(),
  }

  await fs.writeFile(filePath, JSON.stringify(data), "utf-8")
}

/**
 * Clears cache for a specific community
 */
export async function clearCache(packageIndexUrl: string): Promise<void> {
  const cacheKey = getCacheKey(packageIndexUrl)
  const filePath = getCacheFilePath(cacheKey)

  try {
    await fs.unlink(filePath)
  } catch (error) {
    // File doesn't exist, ignore
  }
}

/**
 * Clears all Thunderstore cache
 */
export async function clearAllCache(): Promise<void> {
  const dir = getCacheDir()
  
  try {
    const files = await fs.readdir(dir)
    await Promise.all(
      files
        .filter(f => f.endsWith(".json"))
        .map(f => fs.unlink(join(dir, f)))
    )
  } catch (error) {
    // Directory doesn't exist, ignore
  }
}
