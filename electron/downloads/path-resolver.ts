/**
 * Path resolution for downloads, caches, and metadata
 * Mirrors r2modmanPlus PathResolver semantics while respecting user settings
 */
import { join, basename, normalize } from "path"

/**
 * Settings interface matching the renderer store
 */
export interface PathSettings {
  global: {
    dataFolder: string
    modDownloadFolder: string
    cacheFolder: string
  }
  perGame: Record<string, {
    modDownloadFolder: string
    cacheFolder: string
    modCacheFolder: string
  }>
}

/**
 * Resolved paths for a specific game
 */
export interface ResolvedPaths {
  // Extracted mod cache (r2modmanPlus semantics)
  modCacheRoot: string
  
  // Archive download folder (our app's feature)
  archiveRoot: string
  
  // Thunderstore metadata cache
  metadataCache: string
  
  // Profiles
  profilesRoot: string
}

/**
 * Sanitizes a path segment to be filesystem-safe
 * Strips/replaces: / \ : * ? " < > |
 * Trims whitespace
 * Caps length to 200 chars
 */
export function sanitizePathSegment(segment: string): string {
  return segment
    .replace(/[/\\:*?"<>|]/g, "_")
    .trim()
    .substring(0, 200)
}

/**
 * Ensures a game subdirectory is present under a root folder
 * De-duplicates if the root already ends with the gameId
 * 
 * @param root - Root folder path (may be empty)
 * @param gameId - Game identifier
 * @returns Root unchanged if empty; root if it already ends with gameId; otherwise root/gameId
 */
function ensureGameSubdir(root: string, gameId: string): string {
  if (!root) return ""
  const normalizedRoot = normalize(root)
  const base = basename(normalizedRoot)
  if (base === gameId) {
    return normalizedRoot
  }
  return join(normalizedRoot, gameId)
}

/**
 * Resolves all paths for a specific game based on settings
 * 
 * @param gameId - Game identifier
 * @param settings - User settings from renderer store
 * @returns Resolved paths object
 */
export function resolveGamePaths(gameId: string, settings: PathSettings): ResolvedPaths {
  const { dataFolder, modDownloadFolder: globalModDownloadFolder, cacheFolder: globalCacheFolder } = settings.global
  const perGame = settings.perGame[gameId] || {}
  
  // 1) Extracted mod cache root
  // Priority: perGame.modCacheFolder/cache/<gameId> > dataFolder/<gameId>/cache
  // If user sets per-game folder, add "cache" subfolder for organization
  const modCacheRoot = perGame.modCacheFolder 
    ? ensureGameSubdir(join(perGame.modCacheFolder, "cache"), gameId)
    : join(dataFolder, gameId, "cache")
  
  // 2) Archive download root
  // Priority: perGame.modDownloadFolder/download/<gameId> > global.modDownloadFolder/<gameId> > dataFolder/downloads/<gameId>
  // If user sets per-game folder, add "download" subfolder for organization
  // Always nests under <gameId> subfolder (de-duped if already present)
  const archiveRoot = perGame.modDownloadFolder
    ? ensureGameSubdir(join(perGame.modDownloadFolder, "download"), gameId)
    : globalModDownloadFolder
      ? ensureGameSubdir(globalModDownloadFolder, gameId)
      : join(dataFolder, "downloads", gameId)
  
  // 3) Thunderstore metadata cache
  // Priority: perGame.cacheFolder/cache/thunderstore > global.cacheFolder/thunderstore > dataFolder/cache/thunderstore
  // If user sets per-game cache folder, add "cache" subfolder for organization
  const metadataCache = perGame.cacheFolder
    ? join(perGame.cacheFolder, "cache", "thunderstore")
    : globalCacheFolder
      ? join(globalCacheFolder, "thunderstore")
      : join(dataFolder, "cache", "thunderstore")
  
  // 4) Profiles root
  const profilesRoot = join(dataFolder, gameId, "profiles")
  
  return {
    modCacheRoot,
    archiveRoot,
    metadataCache,
    profilesRoot,
  }
}

/**
 * Gets extracted mod cache path for a specific mod version
 * 
 * @param modCacheRoot - Root of mod cache (from resolveGamePaths)
 * @param author - Mod author
 * @param name - Mod name
 * @param version - Mod version
 * @returns Full path to extracted mod folder
 */
export function getExtractedModPath(
  modCacheRoot: string,
  author: string,
  name: string,
  version: string
): string {
  const authorMod = sanitizePathSegment(`${author}-${name}`)
  const versionSafe = sanitizePathSegment(version)
  return join(modCacheRoot, authorMod, versionSafe)
}

/**
 * Gets archive path for a specific mod version
 * 
 * @param archiveRoot - Root of archive folder (from resolveGamePaths)
 * @param author - Mod author
 * @param name - Mod name
 * @param version - Mod version
 * @returns Full path to mod zip archive
 */
export function getArchivePath(
  archiveRoot: string,
  author: string,
  name: string,
  version: string
): string {
  const authorMod = sanitizePathSegment(`${author}-${name}`)
  const versionSafe = sanitizePathSegment(version)
  return join(archiveRoot, authorMod, `${versionSafe}.zip`)
}

/**
 * Applies CDN preference to a download URL
 * 
 * @param downloadUrl - Original download URL
 * @param preferredCdn - CDN preference ("main" or CDN name)
 * @returns Modified URL with CDN query param if needed
 */
export function applyThunderstoreCdn(downloadUrl: string, preferredCdn: string): string {
  if (preferredCdn === "main") {
    return downloadUrl
  }
  
  const url = new URL(downloadUrl)
  url.searchParams.set("cdn", preferredCdn)
  return url.toString()
}
