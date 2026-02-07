/**
 * Profile mod installer
 * Handles copying extracted mod files to profile folders
 */
import { promises as fs } from "fs"
import { join } from "path"
import { ensureDir, copyFile, pathExists, removeDir } from "../downloads/fs-utils"
import { resolveGamePaths, type PathSettings } from "../downloads/path-resolver"
import { getLogger } from "../file-logger"

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
 * Resolves the effective root directory for mod installation
 * Handles nested top-level folder zips (e.g., SomeFolder/BepInEx/...)
 *
 * Algorithm:
 * 1. If <extractedModPath>/BepInEx exists => return extractedModPath
 * 2. Else check immediate children for one with BepInEx => return that child
 * 3. Else return extractedModPath
 *
 * @param extractedModPath - Path to extracted mod folder
 * @returns The effective root path to use for installation
 */
async function resolveEffectiveRoot(extractedModPath: string): Promise<string> {
  const logger = getLogger()

  // Check if BepInEx exists at the top level
  const topLevelBepInEx = join(extractedModPath, "BepInEx")
  if (await pathExists(topLevelBepInEx)) {
    logger.info(`effectiveRoot: using extractedModPath (BepInEx at top level)`, { effectiveRoot: extractedModPath })
    return extractedModPath
  }

  // Check immediate children for BepInEx
  try {
    const entries = await fs.readdir(extractedModPath, { withFileTypes: true })
    const directories = entries
      .filter(entry => entry.isDirectory())
      .sort((a, b) => a.name.localeCompare(b.name))

    for (const dir of directories) {
      const childPath = join(extractedModPath, dir.name)
      const childBepInEx = join(childPath, "BepInEx")
      if (await pathExists(childBepInEx)) {
        logger.info(`effectiveRoot: using nested folder (BepInEx found in child)`, {
          effectiveRoot: childPath,
          childFolder: dir.name
        })
        return childPath
      }
    }
  } catch (error) {
    logger.warn(`Failed to scan for nested BepInEx folders`, { error, extractedModPath })
  }

  // No BepInEx found anywhere - use extractedModPath as fallback
  logger.info(`effectiveRoot: using extractedModPath (no BepInEx structure found)`, {
    effectiveRoot: extractedModPath
  })
  return extractedModPath
}

/**
 * Installs a mod to a profile by copying extracted files
 *
 * Profile structure:
 * - <profileRoot>/BepInEx/plugins/<author-modname>/
 * - <profileRoot>/BepInEx/patchers/<author-modname>/
 * - <profileRoot>/BepInEx/core/<author-modname>/
 * - <profileRoot>/BepInEx/monomod/<author-modname>/
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
  const logger = getLogger()

  // Ensure extracted mod exists
  if (!(await pathExists(extractedModPath))) {
    throw new Error(`Extracted mod not found at: ${extractedModPath}`)
  }

  // Resolve effective root (handles nested folder zips)
  const effectiveRoot = await resolveEffectiveRoot(extractedModPath)

  // Ensure profile root exists
  await ensureDir(profileRoot)

  // Set up profile BepInEx structure
  const profileBepInExRoot = join(profileRoot, "BepInEx")
  const profilePluginsRoot = join(profileBepInExRoot, "plugins")
  const profileConfigRoot = join(profileBepInExRoot, "config")
  const profilePatchersRoot = join(profileBepInExRoot, "patchers")
  const profileCoreRoot = join(profileBepInExRoot, "core")
  const profileMonomodRoot = join(profileBepInExRoot, "monomod")

  await ensureDir(profilePluginsRoot)
  await ensureDir(profileConfigRoot)
  await ensureDir(profilePatchersRoot)
  await ensureDir(profileCoreRoot)
  await ensureDir(profileMonomodRoot)

  // Check if effective root has BepInEx structure
  const effectiveRootBepInEx = join(effectiveRoot, "BepInEx")
  const hasBepInExStructure = await pathExists(effectiveRootBepInEx)

  let filesCopied = 0
  const sourceRoutes: string[] = []

  if (hasBepInExStructure) {
    logger.info(`Installing mod ${modId} with BepInEx structure`, { effectiveRoot, hasBepInExStructure })

    // Define all possible routes
    const routes = [
      { name: "plugins", src: join(effectiveRootBepInEx, "plugins"), dest: join(profilePluginsRoot, modId) },
      { name: "patchers", src: join(effectiveRootBepInEx, "patchers"), dest: join(profilePatchersRoot, modId) },
      { name: "core", src: join(effectiveRootBepInEx, "core"), dest: join(profileCoreRoot, modId) },
      { name: "monomod", src: join(effectiveRootBepInEx, "monomod"), dest: join(profileMonomodRoot, modId) },
    ]

    // Copy namespaced routes (plugins, patchers, core, monomod)
    for (const route of routes) {
      if (await pathExists(route.src)) {
        sourceRoutes.push(route.name)
        // Remove existing destination folder for idempotency
        if (await pathExists(route.dest)) {
          await removeDir(route.dest)
        }
        await copyDirectory(route.src, route.dest)
        const count = await countFiles(route.src)
        filesCopied += count
        logger.info(`Copied ${route.name} route for ${modId}`, { src: route.src, dest: route.dest, files: count })
      }
    }

    // Copy config files (merge into profile config, not isolated by mod)
    const extractedConfig = join(effectiveRootBepInEx, "config")
    if (await pathExists(extractedConfig)) {
      sourceRoutes.push("config")
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
      logger.info(`Merged config files for ${modId}`, { src: extractedConfig, dest: profileConfigRoot })
    }

    logger.info(`Mod ${modId} installation complete`, {
      effectiveRoot,
      sourceRoutes,
      filesCopied
    })
  } else {
    // Mod files are at root (no BepInEx structure) - copy everything to plugins/<modId>
    logger.info(`Installing mod ${modId} without BepInEx structure (fallback to plugins)`, { effectiveRoot })

    const modPluginPath = join(profilePluginsRoot, modId)
    // Remove existing destination folder for idempotency
    if (await pathExists(modPluginPath)) {
      await removeDir(modPluginPath)
    }
    await copyDirectory(effectiveRoot, modPluginPath)
    filesCopied = await countFiles(effectiveRoot)

    logger.info(`Mod ${modId} installation complete (fallback)`, {
      effectiveRoot,
      dest: modPluginPath,
      filesCopied
    })
  }

  return {
    filesCopied,
    pluginPath: join(profilePluginsRoot, modId),
    configPath: profileConfigRoot,
  }
}

/**
 * Uninstalls a mod from a profile by deleting its folders
 * Config files are left alone (they may be shared by other mods)
 *
 * Removes:
 * - BepInEx/plugins/<modId>
 * - BepInEx/patchers/<modId>
 * - BepInEx/core/<modId>
 * - BepInEx/monomod/<modId>
 *
 * @param profileRoot - Root path for the profile
 * @param modId - Mod identifier (author-modname)
 * @returns Number of files removed
 */
export async function uninstallModFromProfile(
  profileRoot: string,
  modId: string
): Promise<number> {
  const logger = getLogger()

  const paths = [
    join(profileRoot, "BepInEx", "plugins", modId),
    join(profileRoot, "BepInEx", "patchers", modId),
    join(profileRoot, "BepInEx", "core", modId),
    join(profileRoot, "BepInEx", "monomod", modId),
  ]

  let filesRemoved = 0
  const removedPaths: string[] = []

  for (const path of paths) {
    if (await pathExists(path)) {
      const count = await countFiles(path)
      await fs.rm(path, { recursive: true, force: true })
      filesRemoved += count
      removedPaths.push(path)
    }
  }

  logger.info(`Uninstalled mod ${modId}`, { filesRemoved, removedPaths })

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
