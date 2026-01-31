/**
 * Profile mod installer
 * Handles copying extracted mod files to profile folders
 */
import { promises as fs } from "fs"
import { join } from "path"
import { ensureDir, copyFile, pathExists, removeDir } from "../downloads/fs-utils"
import { resolveGamePaths, type PathSettings } from "../downloads/path-resolver"

/**
 * Recursively copies all files and directories from source to destination
 * Preserves directory structure
 * 
 * @param srcDir - Source directory
 * @param destDir - Destination directory
 */
async function copyDirectory(srcDir: string, destDir: string): Promise<void> {
  await ensureDir(destDir)
  
  const entries = await fs.readdir(srcDir, { withFileTypes: true })
  
  for (const entry of entries) {
    const srcPath = join(srcDir, entry.name)
    const destPath = join(destDir, entry.name)
    
    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath)
    } else {
      await copyFile(srcPath, destPath)
    }
  }
}

/**
 * Installs a mod to a profile by copying extracted files
 * 
 * Profile structure:
 * - <profileRoot>/BepInEx/plugins/<author-modname>/
 * - <profileRoot>/BepInEx/config/
 * 
 * @param extractedModPath - Path to extracted mod folder
 * @param profileRoot - Root path for the profile
 * @param modId - Mod identifier (author-modname)
 * @returns Object with copied file count and destination paths
 */
export async function installModToProfile(
  extractedModPath: string,
  profileRoot: string,
  modId: string
): Promise<{ filesCopied: number; pluginPath: string; configPath: string }> {
  // Ensure extracted mod exists
  if (!(await pathExists(extractedModPath))) {
    throw new Error(`Extracted mod not found at: ${extractedModPath}`)
  }
  
  // Ensure profile root exists
  await ensureDir(profileRoot)
  
  // Set up profile BepInEx structure
  const profileBepInExRoot = join(profileRoot, "BepInEx")
  const profilePluginsRoot = join(profileBepInExRoot, "plugins")
  const profileConfigRoot = join(profileBepInExRoot, "config")
  const modPluginPath = join(profilePluginsRoot, modId)
  
  await ensureDir(profilePluginsRoot)
  await ensureDir(profileConfigRoot)
  
  // Check if extracted mod has BepInEx structure
  const extractedBepInEx = join(extractedModPath, "BepInEx")
  const hasBepInExStructure = await pathExists(extractedBepInEx)
  
  let filesCopied = 0
  
  if (hasBepInExStructure) {
    // Mod has BepInEx/plugins and BepInEx/config structure
    const extractedPlugins = join(extractedBepInEx, "plugins")
    const extractedConfig = join(extractedBepInEx, "config")
    
    // Copy plugins
    if (await pathExists(extractedPlugins)) {
      await copyDirectory(extractedPlugins, modPluginPath)
      filesCopied += await countFiles(extractedPlugins)
    }
    
    // Copy config files (merge into profile config, not isolated by mod)
    if (await pathExists(extractedConfig)) {
      const configEntries = await fs.readdir(extractedConfig, { withFileTypes: true })
      for (const entry of configEntries) {
        const srcPath = join(extractedConfig, entry.name)
        const destPath = join(profileConfigRoot, entry.name)
        
        if (entry.isDirectory()) {
          await copyDirectory(srcPath, destPath)
        } else {
          await copyFile(srcPath, destPath)
        }
        filesCopied++
      }
    }
  } else {
    // Mod files are at root (no BepInEx structure) - copy everything to plugins/<modId>
    await copyDirectory(extractedModPath, modPluginPath)
    filesCopied = await countFiles(extractedModPath)
  }
  
  return {
    filesCopied,
    pluginPath: modPluginPath,
    configPath: profileConfigRoot,
  }
}

/**
 * Uninstalls a mod from a profile by deleting its plugin folder
 * Config files are left alone (they may be shared by other mods)
 * 
 * @param profileRoot - Root path for the profile
 * @param modId - Mod identifier (author-modname)
 * @returns Number of files removed
 */
export async function uninstallModFromProfile(
  profileRoot: string,
  modId: string
): Promise<number> {
  const modPluginPath = join(profileRoot, "BepInEx", "plugins", modId)
  
  if (!(await pathExists(modPluginPath))) {
    return 0
  }
  
  const filesRemoved = await countFiles(modPluginPath)
  await fs.rm(modPluginPath, { recursive: true, force: true })
  
  return filesRemoved
}

/**
 * Recursively counts all files in a directory
 */
async function countFiles(dirPath: string): Promise<number> {
  let count = 0
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name)
      if (entry.isDirectory()) {
        count += await countFiles(fullPath)
      } else {
        count++
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
    return 0
  }
  
  return count
}

/**
 * Resets a profile by deleting its BepInEx folder
 * This removes all installed mods (plugins + config + everything under BepInEx)
 * 
 * @param profileRoot - Root path for the profile
 * @returns Number of files removed
 */
export async function resetProfileBepInEx(profileRoot: string): Promise<number> {
  const bepInExPath = join(profileRoot, "BepInEx")
  
  if (!(await pathExists(bepInExPath))) {
    return 0
  }
  
  const filesRemoved = await countFiles(bepInExPath)
  await removeDir(bepInExPath)
  
  return filesRemoved
}

/**
 * Deletes all cached downloads and extracted mods for a game
 * Removes archiveRoot and modCacheRoot
 * 
 * @param gameId - Game identifier
 * @param pathSettings - Path settings from settings store
 * @returns Object with counts of removed files
 */
export async function deleteGameCaches(
  gameId: string,
  pathSettings: PathSettings
): Promise<{ archivesRemoved: number; cacheRemoved: number }> {
  const paths = resolveGamePaths(gameId, pathSettings)
  
  let archivesRemoved = 0
  let cacheRemoved = 0
  
  // Remove archive downloads
  if (await pathExists(paths.archiveRoot)) {
    archivesRemoved = await countFiles(paths.archiveRoot)
    await removeDir(paths.archiveRoot)
  }
  
  // Remove extracted mod cache
  if (await pathExists(paths.modCacheRoot)) {
    cacheRemoved = await countFiles(paths.modCacheRoot)
    await removeDir(paths.modCacheRoot)
  }
  
  return {
    archivesRemoved,
    cacheRemoved,
  }
}
