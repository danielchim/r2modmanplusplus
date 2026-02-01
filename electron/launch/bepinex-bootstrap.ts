/**
 * BepInEx bootstrap system
 * Handles downloading, extracting, and copying BepInEx pack to profile
 */
import { promises as fs } from "fs"
import { join } from "path"
import { pathExists, ensureDir } from "../downloads/fs-utils"
import { getPathSettings } from "../downloads/settings-state"
import { ensureCatalogUpToDate, resolvePackagesByOwnerName } from "../thunderstore/catalog"
import { downloadMod } from "../downloads/downloader"
import { getExtractedModPath, getArchivePath, resolveGamePaths } from "../downloads/path-resolver"

/**
 * Result of ensuring BepInEx is available
 */
export interface BepInExBootstrapResult {
  available: boolean
  version?: string
  bootstrapRoot?: string
  error?: string
}

/**
 * Gets the bootstrap directory for a game
 */
function getBootstrapDir(gameId: string, owner: string, name: string, version: string): string {
  const dataFolder = getPathSettings().global.dataFolder
  return join(dataFolder, gameId, "_state", "bootstrap", `${owner}-${name}`, version)
}

/**
 * Finds a BepInEx pack in the catalog by owner and name
 */
async function findBepInExPack(
  packageIndexUrl: string,
  owner: string,
  name: string
): Promise<{ uuid4: string; version: string; downloadUrl: string } | null> {
  try {
    // Ensure catalog is up-to-date
    await ensureCatalogUpToDate(packageIndexUrl)
    
    // Look up the package by owner-name
    const packageId = `${owner}-${name}`
    const packages = resolvePackagesByOwnerName(packageIndexUrl, [packageId])
    const pack = packages.get(packageId)
    
    if (!pack || pack.versions.length === 0) {
      console.error(`[BepInExBootstrap] ${packageId} not found in catalog`)
      return null
    }
    
    const latestVersion = pack.versions[0]
    
    return {
      uuid4: pack.uuid4,
      version: latestVersion.version_number,
      downloadUrl: latestVersion.download_url,
    }
  } catch (error) {
    console.error(`[BepInExBootstrap] Failed to find BepInEx pack:`, error)
    return null
  }
}

/**
 * Downloads and extracts BepInEx pack to bootstrap directory
 */
async function downloadBepInExPack(
  gameId: string,
  owner: string,
  name: string,
  version: string,
  downloadUrl: string
): Promise<string> {
  console.log(`[BepInExBootstrap] Downloading ${owner}-${name} ${version}`)
  
  const settings = getPathSettings()
  const paths = resolveGamePaths(gameId, settings)
  
  // Use standard download paths
  const archivePath = getArchivePath(paths.archiveRoot, owner, name, version)
  const extractPath = getExtractedModPath(paths.modCacheRoot, owner, name, version)
  
  // Download and extract
  const result = await downloadMod({
    gameId,
    author: owner,
    name,
    version,
    downloadUrl,
    archivePath,
    extractPath,
    ignoreCache: false,
  })
  
  // Copy to bootstrap directory for persistence
  const bootstrapDir = getBootstrapDir(gameId, owner, name, version)
  await ensureDir(bootstrapDir)
  
  console.log(`[BepInExBootstrap] Copying to bootstrap directory: ${bootstrapDir}`)
  await copyDirectory(result.extractedPath, bootstrapDir)
  
  return bootstrapDir
}

/**
 * Recursively copies directory contents
 */
async function copyDirectory(src: string, dest: string): Promise<void> {
  await ensureDir(dest)
  
  const entries = await fs.readdir(src, { withFileTypes: true })
  
  for (const entry of entries) {
    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)
    
    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath)
    } else {
      await fs.copyFile(srcPath, destPath)
    }
  }
}

/**
 * Validates that a BepInEx bootstrap directory contains required files
 * Returns the effective root (handles nested extraction from zips)
 */
async function validateBepInExBootstrap(bootstrapRoot: string): Promise<{ valid: boolean; effectiveRoot?: string }> {
  console.log(`[BepInExBootstrap] Validating bootstrap at ${bootstrapRoot}`)
  
  // Helper to check if a path has required files
  async function hasRequiredFiles(root: string): Promise<boolean> {
    // 1. Check for BepInEx/core/*Preloader*.dll
    const coreDir = join(root, "BepInEx", "core")
    if (!(await pathExists(coreDir))) {
      return false
    }
    
    const coreEntries = await fs.readdir(coreDir)
    const hasPreloader = coreEntries.some(name => 
      name.toLowerCase().includes("preloader") && name.toLowerCase().endsWith(".dll")
    )
    
    if (!hasPreloader) {
      console.log(`[BepInExBootstrap] Missing BepInEx Preloader DLL in ${coreDir}`)
      return false
    }
    
    // 2. Check for a Doorstop proxy DLL (winhttp.dll, version.dll, etc.)
    const rootEntries = await fs.readdir(root)
    const proxyDlls = ["winhttp.dll", "version.dll", "winmm.dll"]
    const hasProxy = rootEntries.some(name => 
      proxyDlls.includes(name.toLowerCase())
    )
    
    if (!hasProxy) {
      console.log(`[BepInExBootstrap] Missing Doorstop proxy DLL in ${root}`)
      return false
    }
    
    // 3. Check for doorstop_config.ini
    const configPath = join(root, "doorstop_config.ini")
    if (!(await pathExists(configPath))) {
      console.log(`[BepInExBootstrap] Missing doorstop_config.ini in ${root}`)
      return false
    }
    
    return true
  }
  
  // Try the root directly first
  if (await hasRequiredFiles(bootstrapRoot)) {
    console.log(`[BepInExBootstrap] Bootstrap valid at root level`)
    return { valid: true, effectiveRoot: bootstrapRoot }
  }
  
  // Check for nested extraction (zip contained a top-level folder)
  // e.g., bootstrapRoot/BepInExPack_5.4.2304/BepInEx
  try {
    const entries = await fs.readdir(bootstrapRoot, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const nestedPath = join(bootstrapRoot, entry.name)
        if (await hasRequiredFiles(nestedPath)) {
          console.log(`[BepInExBootstrap] Bootstrap valid at nested level: ${entry.name}`)
          return { valid: true, effectiveRoot: nestedPath }
        }
      }
    }
  } catch {
    // Ignore readdir errors
  }
  
  console.log(`[BepInExBootstrap] Bootstrap validation failed`)
  return { valid: false }
}

/**
 * Ensures BepInEx pack is available for a game
 * Downloads if necessary, returns path to bootstrap directory
 */
export async function ensureBepInExPack(
  gameId: string,
  packageIndexUrl: string,
  modloaderPackage?: {
    owner: string
    name: string
    rootFolder: string
  }
): Promise<BepInExBootstrapResult> {
  console.log(`[BepInExBootstrap] Ensuring BepInEx pack for ${gameId}`)
  
  // Default to BepInEx-BepInExPack if not specified
  const packageOwner = modloaderPackage?.owner || "BepInEx"
  const packageName = modloaderPackage?.name || "BepInExPack"
  const packageId = `${packageOwner}-${packageName}`
  
  try {
    // Find BepInEx pack in catalog
    const packInfo = await findBepInExPack(packageIndexUrl, packageOwner, packageName)
    
    if (!packInfo) {
      return {
        available: false,
        error: `${packageId} not found in Thunderstore catalog`,
      }
    }
    
    // Check if already downloaded
    const bootstrapDir = getBootstrapDir(gameId, packageOwner, packageName, packInfo.version)
    
    if (await pathExists(bootstrapDir)) {
      // Validate the bootstrap cache
      const validation = await validateBepInExBootstrap(bootstrapDir)
      
      if (validation.valid && validation.effectiveRoot) {
        console.log(`[BepInExBootstrap] BepInEx pack ${packInfo.version} already available and valid`)
        return {
          available: true,
          version: packInfo.version,
          bootstrapRoot: validation.effectiveRoot,
        }
      }
      
      // Bootstrap exists but is corrupt/incomplete - delete and redownload
      console.warn(`[BepInExBootstrap] Bootstrap cache is corrupt or incomplete, removing and redownloading`)
      try {
        await fs.rm(bootstrapDir, { recursive: true, force: true })
      } catch (error) {
        console.error(`[BepInExBootstrap] Failed to remove corrupt bootstrap:`, error)
        return {
          available: false,
          error: "Bootstrap cache is corrupt and could not be removed - check file permissions",
        }
      }
    }
    
    // Download and extract
    const extractedPath = await downloadBepInExPack(
      gameId,
      packageOwner,
      packageName,
      packInfo.version,
      packInfo.downloadUrl
    )
    
    // Validate the newly downloaded bootstrap
    const validation = await validateBepInExBootstrap(extractedPath)
    
    if (!validation.valid || !validation.effectiveRoot) {
      return {
        available: false,
        error: "Downloaded BepInEx pack is missing required files (winhttp.dll or BepInEx/core/*Preloader*.dll) - check if antivirus quarantined them",
      }
    }
    
    console.log(`[BepInExBootstrap] BepInEx pack ${packInfo.version} ready`)
    
    return {
      available: true,
      version: packInfo.version,
      bootstrapRoot: validation.effectiveRoot,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[BepInExBootstrap] Failed to ensure BepInEx pack:`, error)
    
    return {
      available: false,
      error: `Failed to download BepInEx pack: ${message}`,
    }
  }
}

/**
 * Copies BepInEx bootstrap files to profile root
 * Idempotent operation
 */
async function hasBepInExCore(root: string): Promise<boolean> {
  const coreDir = join(root, "BepInEx", "core")
  return await pathExists(coreDir)
}

async function resolvePackRoot(baseDir: string): Promise<string> {
  if (await hasBepInExCore(baseDir)) {
    return baseDir
  }
  
  const entries = await fs.readdir(baseDir, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const candidate = join(baseDir, entry.name)
    if (await hasBepInExCore(candidate)) {
      return candidate
    }
  }
  
  throw new Error(`BepInEx pack at ${baseDir} does not contain a BepInEx/core directory`)
}

export async function copyBepInExToProfile(
  bootstrapRoot: string,
  profileRoot: string
): Promise<void> {
  console.log(`[BepInExBootstrap] Copying BepInEx to profile: ${profileRoot}`)
  
  await ensureDir(profileRoot)
  const packRoot = await resolvePackRoot(bootstrapRoot)
  
  // Copy BepInEx folder
  const bepInExSrc = join(packRoot, "BepInEx")
  const bepInExDest = join(profileRoot, "BepInEx")
  
  if (await pathExists(bepInExSrc)) {
    await copyDirectory(bepInExSrc, bepInExDest)
  } else {
    throw new Error(`BepInEx folder not found in pack root ${packRoot}`)
  }
  
  // Copy root Doorstop files (winhttp.dll, doorstop_config.ini, etc.)
  const entries = await fs.readdir(packRoot, { withFileTypes: true })
  
  for (const entry of entries) {
    if (entry.isFile() && entry.name !== "manifest.json" && entry.name !== "icon.png" && entry.name !== "README.md") {
      const srcPath = join(packRoot, entry.name)
      const destPath = join(profileRoot, entry.name)
      await fs.copyFile(srcPath, destPath)
    }
  }
  
  console.log(`[BepInExBootstrap] BepInEx copied to profile from ${packRoot}`)
}
