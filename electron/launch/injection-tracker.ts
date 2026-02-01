/**
 * Injection tracking and manifest management
 * Tracks files injected into game install folders for safe cleanup
 */
import { promises as fs } from "fs"
import { join, dirname } from "path"
import { createHash } from "crypto"
import { pathExists, ensureDir } from "../downloads/fs-utils"
import { getPathSettings } from "../downloads/settings-state"

/**
 * Manifest entry for a single injected file or directory
 */
interface InjectedFileEntry {
  /** Destination path where file/directory was injected */
  dest: string
  /** Backup path for original file (if it existed) */
  backup?: string
  /** SHA256 hash of the content we injected (for files only) */
  injectedHash?: string
  /** Whether this is a directory */
  isDirectory?: boolean
}

/**
 * Complete injection manifest for a game
 */
interface InjectionManifest {
  gameId: string
  injectedAt: string
  files: InjectedFileEntry[]
}

/**
 * Result of cleanup operation
 */
export interface CleanupResult {
  restored: number
  removed: number
  skipped: number
}

/**
 * Gets the manifest file path for a game
 */
function getManifestPath(gameId: string): string {
  const dataFolder = getPathSettings().global.dataFolder
  return join(dataFolder, gameId, "_state", "injected-manifest.json")
}

/**
 * Gets the backup directory for a game
 */
function getBackupDir(gameId: string): string {
  const dataFolder = getPathSettings().global.dataFolder
  return join(dataFolder, gameId, "_state", "injected-backups")
}

/**
 * Computes SHA256 hash of a file
 */
async function hashFile(filePath: string): Promise<string> {
  const content = await fs.readFile(filePath)
  return createHash("sha256").update(content).digest("hex")
}

/**
 * Reads the injection manifest for a game
 */
export async function readManifest(gameId: string): Promise<InjectionManifest | null> {
  const manifestPath = getManifestPath(gameId)
  
  if (!(await pathExists(manifestPath))) {
    return null
  }
  
  try {
    const content = await fs.readFile(manifestPath, "utf-8")
    return JSON.parse(content)
  } catch (error) {
    console.error(`[InjectionTracker] Failed to read manifest for ${gameId}:`, error)
    return null
  }
}

/**
 * Writes the injection manifest for a game
 */
async function writeManifest(manifest: InjectionManifest): Promise<void> {
  const manifestPath = getManifestPath(manifest.gameId)
  await ensureDir(dirname(manifestPath))
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8")
}

/**
 * Recursively collects all files in a directory for injection
 * Returns array of { src: absolute, dest: relative } file paths
 */
async function collectFilesRecursive(
  srcRoot: string,
  destRoot: string,
  currentSrc: string = srcRoot,
  currentDest: string = destRoot
): Promise<Array<{ src: string; dest: string }>> {
  const files: Array<{ src: string; dest: string }> = []
  
  const entries = await fs.readdir(currentSrc, { withFileTypes: true })
  
  for (const entry of entries) {
    const srcPath = join(currentSrc, entry.name)
    const destPath = join(currentDest, entry.name)
    
    if (entry.isDirectory()) {
      // Recursively collect files from subdirectory
      const subFiles = await collectFilesRecursive(srcRoot, destRoot, srcPath, destPath)
      files.push(...subFiles)
    } else {
      files.push({
        src: srcPath,
        dest: destPath,
      })
    }
  }
  
  return files
}

/**
 * Injects files and directories into the game install folder with tracking
 * Directories are expanded into per-file injections for proper backup/restore
 * 
 * @param gameId - Game identifier
 * @param installFolder - Game install folder
 * @param filesToInject - Array of { src, dest, isDirectory? } entries
 */
export async function injectFiles(
  gameId: string,
  installFolder: string,
  filesToInject: Array<{ src: string; dest: string; isDirectory?: boolean }>
): Promise<void> {
  console.log(`[InjectionTracker] Injecting ${filesToInject.length} items for ${gameId}`)
  
  const backupDir = getBackupDir(gameId)
  await ensureDir(backupDir)
  
  const entries: InjectedFileEntry[] = []
  
  for (const { src, dest, isDirectory } of filesToInject) {
    if (isDirectory) {
      // Expand directory into individual file injections
      console.log(`[InjectionTracker]   Expanding directory ${dest}`)
      const srcAbsolute = src
      const destRelative = dest
      const destAbsolute = join(installFolder, destRelative)
      
      // Collect all files in the source directory
      const files = await collectFilesRecursive(srcAbsolute, destRelative)
      
      console.log(`[InjectionTracker]   Found ${files.length} files in directory ${dest}`)
      
      // Inject each file individually
      for (const file of files) {
        const fileDestPath = join(installFolder, file.dest)
        await ensureDir(dirname(fileDestPath))
        
        let backupPath: string | undefined
        
        // Backup original if it exists
        if (await pathExists(fileDestPath)) {
          const timestamp = Date.now()
          const backupName = `${file.dest.replace(/[/\\]/g, "_")}_${timestamp}`
          backupPath = join(backupDir, backupName)
          
          console.log(`[InjectionTracker]     Backing up existing ${file.dest}`)
          await fs.copyFile(fileDestPath, backupPath)
        }
        
        // Copy new file
        console.log(`[InjectionTracker]     Injecting ${file.dest}`)
        await fs.copyFile(file.src, fileDestPath)
        
        // Compute hash of injected content
        const injectedHash = await hashFile(fileDestPath)
        
        entries.push({
          dest: fileDestPath,
          backup: backupPath,
          injectedHash,
          isDirectory: false,
        })
      }
    } else {
      // File injection - backup and track with hash
      const destPath = join(installFolder, dest)
      await ensureDir(dirname(destPath))
      
      let backupPath: string | undefined
      
      // Backup original if it exists
      if (await pathExists(destPath)) {
        const timestamp = Date.now()
        const backupName = `${dest.replace(/[/\\]/g, "_")}_${timestamp}`
        backupPath = join(backupDir, backupName)
        
        console.log(`[InjectionTracker]   Backing up existing ${dest}`)
        await fs.copyFile(destPath, backupPath)
      }
      
      // Copy new file
      console.log(`[InjectionTracker]   Injecting ${dest}`)
      await fs.copyFile(src, destPath)
      
      // Compute hash of injected content
      const injectedHash = await hashFile(destPath)
      
      entries.push({
        dest: destPath,
        backup: backupPath,
        injectedHash,
        isDirectory: false,
      })
    }
  }
  
  // Write manifest
  const manifest: InjectionManifest = {
    gameId,
    injectedAt: new Date().toISOString(),
    files: entries,
  }
  
  await writeManifest(manifest)
  console.log(`[InjectionTracker] Injection complete, ${entries.length} files tracked in manifest`)
}

/**
 * Recursively copies a directory (kept for backwards compatibility, but not used in injection anymore)
 */
async function copyDirectoryRecursive(src: string, dest: string): Promise<void> {
  await ensureDir(dest)
  
  const entries = await fs.readdir(src, { withFileTypes: true })
  
  for (const entry of entries) {
    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)
    
    if (entry.isDirectory()) {
      await copyDirectoryRecursive(srcPath, destPath)
    } else {
      await fs.copyFile(srcPath, destPath)
    }
  }
}

/**
 * Cleans up injected files for a game
 * Restores backups and removes injected items
 * Skips files that have been modified since injection
 */
export async function cleanupInjected(gameId: string): Promise<CleanupResult> {
  console.log(`[InjectionTracker] Cleaning up injected items for ${gameId}`)
  
  const result: CleanupResult = {
    restored: 0,
    removed: 0,
    skipped: 0,
  }
  
  const manifest = await readManifest(gameId)
  
  if (!manifest) {
    console.log(`[InjectionTracker] No manifest found for ${gameId}`)
    return result
  }
  
  // Process files in reverse order to handle nested paths cleanly
  const files = [...manifest.files].reverse()
  
  for (const entry of files) {
    const { dest, backup, injectedHash, isDirectory } = entry
    
    // Legacy handling for directory entries (should not exist with new implementation)
    if (isDirectory) {
      if (await pathExists(dest)) {
        console.log(`[InjectionTracker]   Removing legacy directory entry ${dest}`)
        try {
          await fs.rm(dest, { recursive: true, force: true })
          result.removed++
        } catch (error) {
          console.error(`[InjectionTracker]   Failed to remove directory ${dest}:`, error)
          result.skipped++
        }
      } else {
        result.skipped++
      }
      continue
    }
    
    // File handling
    // Check if file still exists
    if (!(await pathExists(dest))) {
      console.log(`[InjectionTracker]   ${dest} no longer exists, skipping`)
      result.skipped++
      continue
    }
    
    // Check if file has been modified since injection
    if (injectedHash) {
      const currentHash = await hashFile(dest)
      if (currentHash !== injectedHash) {
        console.log(`[InjectionTracker]   ${dest} has been modified, skipping`)
        result.skipped++
        continue
      }
    }
    
    // Restore backup if it exists
    if (backup && (await pathExists(backup))) {
      console.log(`[InjectionTracker]   Restoring ${dest} from backup`)
      await fs.copyFile(backup, dest)
      await fs.unlink(backup)
      result.restored++
    } else {
      // No backup, just remove the injected file
      console.log(`[InjectionTracker]   Removing ${dest}`)
      await fs.unlink(dest)
      result.removed++
    }
  }
  
  // Clean up empty directories (best effort)
  await cleanupEmptyDirectories(manifest, result)
  
  // Delete manifest
  const manifestPath = getManifestPath(gameId)
  if (await pathExists(manifestPath)) {
    await fs.unlink(manifestPath)
  }
  
  console.log(`[InjectionTracker] Cleanup complete: restored=${result.restored}, removed=${result.removed}, skipped=${result.skipped}`)
  
  return result
}

/**
 * Cleans up empty directories left behind after file removal
 * Best effort - doesn't count toward cleanup stats
 */
async function cleanupEmptyDirectories(manifest: InjectionManifest, result: CleanupResult): Promise<void> {
  // Collect all unique parent directories from injected files
  const dirs = new Set<string>()
  
  for (const entry of manifest.files) {
    if (!entry.isDirectory) {
      let parent = dirname(entry.dest)
      // Add all parent directories up to the installation root
      while (parent && parent !== dirname(parent)) {
        dirs.add(parent)
        parent = dirname(parent)
      }
    }
  }
  
  // Sort directories by depth (deepest first) to remove from bottom up
  const sortedDirs = Array.from(dirs).sort((a, b) => {
    const depthA = a.split(/[/\\]/).length
    const depthB = b.split(/[/\\]/).length
    return depthB - depthA
  })
  
  // Try to remove each directory if empty
  for (const dir of sortedDirs) {
    try {
      if (await pathExists(dir)) {
        const entries = await fs.readdir(dir)
        if (entries.length === 0) {
          console.log(`[InjectionTracker]   Removing empty directory ${dir}`)
          await fs.rmdir(dir)
        }
      }
    } catch (error) {
      // Ignore errors - directory might not be empty or we might not have permission
    }
  }
}
