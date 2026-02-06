import { app, dialog, shell } from "electron"
import { promises as fs } from "fs"
import { join } from "path"
import { z } from "zod"
import { t, publicProcedure } from "./trpc"
import { dataRouter } from "./data"
import { searchPackages, getPackage } from "../thunderstore/search"
import { resolveDependencies, resolveDependenciesRecursive } from "../thunderstore/dependencies"
import { clearCatalog, getCategories, getCatalogStatus } from "../thunderstore/catalog"
import { clearAllCache } from "../thunderstore/cache"
import { getDownloadManager } from "../downloads/manager"
import { setPathSettings, getPathSettings } from "../downloads/settings-state"
import { resolveGamePaths } from "../downloads/path-resolver"
import { installModToProfile, uninstallModFromProfile, resetProfileBepInEx, deleteGameCaches } from "../profiles/mod-installer"
import { verifyBinary } from "../launch/binary-verifier"
import { getProcessStatus } from "../launch/process-tracker"
import { launchGame, type LaunchMode } from "../launch/launcher"
import { cleanupInjected } from "../launch/injection-tracker"
import { checkBaseDependencies, installBaseDependencies } from "../launch/base-dependencies"
import { getLogger } from "../file-logger"

/**
 * Desktop/filesystem procedures
 * Migrated from existing ipcMain handlers
 */
const desktopRouter = t.router({
  /**
   * Get default paths from Electron
   * Returns platform-appropriate defaults for dataFolder and steamFolder
   */
  getDefaultPaths: publicProcedure.query(async () => {
    const dataFolder = app.getPath("userData")
    
    // Best-effort Steam folder detection (Windows focus)
    let steamFolder = ""
    const steamCandidates = [
      "C:\\Program Files (x86)\\Steam",
      "C:\\Program Files\\Steam",
    ]
    
    for (const candidate of steamCandidates) {
      try {
        await fs.access(candidate)
        steamFolder = candidate
        break
      } catch {
        // Directory doesn't exist, try next
      }
    }
    
    return {
      dataFolder,
      steamFolder,
    }
  }),

  /**
   * Open native folder selection dialog
   * Returns selected folder path or null if cancelled
   * On macOS, also allows selecting .app bundles
   */
  selectFolder: publicProcedure.query(async () => {
    // On macOS, allow selecting .app bundles in addition to directories
    // .app bundles are technically directories but appear as files to users
    const properties: ("openDirectory" | "openFile")[] = ["openDirectory"]
    if (process.platform === "darwin") {
      properties.push("openFile")
    }

    const result = await dialog.showOpenDialog({
      properties,
    })

    if (result.canceled) {
      return null
    }

    return result.filePaths[0]
  }),

  /**
   * Open a folder in the system file explorer
   */
  openFolder: publicProcedure
    .input(z.object({ path: z.string() }))
    .mutation(async ({ input }) => {
      await shell.openPath(input.path)
    }),

  /**
   * Health check / greeting query for testing
   */
  greeting: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return {
        text: `Hello ${input.name}`,
        timestamp: new Date(),
      }
    }),
})

/**
 * Thunderstore API procedures
 * Fetches, caches, and searches Thunderstore packages
 */
const thunderstoreRouter = t.router({
  /**
   * Search packages with filtering, sorting, and pagination
   */
  searchPackages: publicProcedure
    .input(
      z.object({
        packageIndexUrl: z.string(),
        gameId: z.string(),
        query: z.string().optional(),
        section: z.enum(["all", "mod", "modpack"]).optional(),
        sort: z.enum(["name", "downloads", "updated"]).optional(),
        sortDir: z.enum(["asc", "desc"]).optional(),
        categories: z.array(z.string()).optional(),
        author: z.string().optional(),
        cursor: z.number().optional(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      return await searchPackages(input)
    }),

  /**
   * Get a single package by UUID
   */
  getPackage: publicProcedure
    .input(
      z.object({
        packageIndexUrl: z.string(),
        gameId: z.string(),
        uuid4: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await getPackage(input.packageIndexUrl, input.gameId, input.uuid4)
    }),

  /**
   * Fetch README HTML from Thunderstore Cyberstorm API
   * This runs in main process to avoid CORS issues
   */
  getReadme: publicProcedure
    .input(
      z.object({
        owner: z.string(),
        name: z.string(),
      })
    )
    .query(async ({ input }) => {
      const url = `https://thunderstore.io/api/cyberstorm/markdown-preview/community/content/${input.owner}/${input.name}/`
      
      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        const html = await response.text()
        return html
      } catch (error) {
        console.error(`Failed to fetch README for ${input.owner}/${input.name}:`, error)
        return ""
      }
    }),

  /**
   * Resolve dependencies for a mod within the same Thunderstore community
   * Returns dependency info with resolved mods and installation status
   */
  resolveDependencies: publicProcedure
    .input(
      z.object({
        packageIndexUrl: z.string(),
        gameId: z.string(),
        dependencies: z.array(z.string()),
        installedVersions: z.record(z.string(), z.string()),
        enforceVersions: z.boolean(),
      })
    )
    .query(async ({ input }) => {
      return await resolveDependencies(input)
    }),

  /**
   * Recursively resolve dependencies with full dependency graph
   * Returns complete closure with parent/child relationships for enforcement
   */
  resolveDependenciesRecursive: publicProcedure
    .input(
      z.object({
        packageIndexUrl: z.string(),
        gameId: z.string(),
        dependencies: z.array(z.string()),
        installedVersions: z.record(z.string(), z.string()),
        enforceVersions: z.boolean(),
        maxDepth: z.number().optional(),
        maxNodes: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      return await resolveDependenciesRecursive(input)
    }),

  /**
   * Clear catalog for a community (forces rebuild on next access)
   * Useful for debugging or when catalog is corrupted
   */
  clearCatalog: publicProcedure
    .input(
      z.object({
        packageIndexUrl: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await clearCatalog(input.packageIndexUrl)
      return { success: true }
    }),

  /**
   * Clear all deprecated JSON cache files
   * Removes all cached package lists from thunderstore-cache folder
   */
  clearAllCache: publicProcedure
    .mutation(async () => {
      await clearAllCache()
      return { success: true }
    }),

  /**
   * Get unique categories from catalog for filtering
   * Returns categories with package counts per category
   */
  getCategories: publicProcedure
    .input(
      z.object({
        packageIndexUrl: z.string(),
        section: z.enum(["all", "mod", "modpack"]).optional(),
      })
    )
    .query(({ input }) => {
      return getCategories(input.packageIndexUrl, input.section)
    }),

  /**
   * Get catalog build status
   * Returns current build progress for showing toast notifications
   */
  getCatalogStatus: publicProcedure
    .input(
      z.object({
        packageIndexUrl: z.string(),
      })
    )
    .query(({ input }) => {
      return getCatalogStatus(input.packageIndexUrl)
    }),
})

/**
 * Downloads procedures
 * Manages mod downloads with queue, progress, and cancellation
 */
const downloadsRouter = t.router({
  /**
   * Enqueue a download
   */
  enqueue: publicProcedure
    .input(
      z.object({
        gameId: z.string(),
        modId: z.string(),
        author: z.string(),
        name: z.string(),
        version: z.string(),
        downloadUrl: z.string(),
        preferredCdn: z.string(),
        ignoreCache: z.boolean(),
      })
    )
    .mutation(({ input }) => {
      const manager = getDownloadManager()
      return manager.enqueue(input)
    }),
  
  /**
   * Cancel a download
   */
  cancel: publicProcedure
    .input(z.object({ downloadId: z.string() }))
    .mutation(({ input }) => {
      const manager = getDownloadManager()
      manager.cancel(input.downloadId)
    }),
  
  /**
   * Pause a download
   */
  pause: publicProcedure
    .input(z.object({ downloadId: z.string() }))
    .mutation(({ input }) => {
      const manager = getDownloadManager()
      manager.pause(input.downloadId)
    }),
  
  /**
   * Resume a download
   */
  resume: publicProcedure
    .input(z.object({ downloadId: z.string() }))
    .mutation(({ input }) => {
      const manager = getDownloadManager()
      manager.resume(input.downloadId)
    }),
  
  /**
   * Get all downloads
   */
  getAll: publicProcedure.query(() => {
    const manager = getDownloadManager()
    return manager.getDownloads()
  }),
  
  /**
   * Get a specific download
   */
  get: publicProcedure
    .input(z.object({ downloadId: z.string() }))
    .query(({ input }) => {
      const manager = getDownloadManager()
      return manager.getDownload(input.downloadId)
    }),
  
  /**
   * Clear completed/failed downloads
   */
  clearInactive: publicProcedure.mutation(() => {
    const manager = getDownloadManager()
    manager.clearInactive()
  }),
  
  /**
   * Update settings
   */
  updateSettings: publicProcedure
    .input(
      z.object({
        maxConcurrent: z.number().optional(),
        speedLimitBps: z.number().optional(),
        pathSettings: z.object({
          global: z.object({
            dataFolder: z.string(),
            modDownloadFolder: z.string(),
            cacheFolder: z.string(),
          }).optional(),
          perGame: z.record(z.string(), z.object({
            modDownloadFolder: z.string(),
            cacheFolder: z.string(),
            modCacheFolder: z.string(),
          })).optional(),
        }).optional(),
      })
    )
    .mutation(({ input }) => {
      const manager = getDownloadManager()
      if (input.maxConcurrent !== undefined) {
        manager.setMaxConcurrent(input.maxConcurrent)
      }
      if (input.speedLimitBps !== undefined) {
        manager.setSpeedLimit(input.speedLimitBps)
      }
      if (input.pathSettings) {
        setPathSettings(input.pathSettings)
      }
    }),
  
  /**
   * Get resolved paths for a game
   * Returns the actual computed paths based on current settings
   */
  getResolvedPaths: publicProcedure
    .input(z.object({ gameId: z.string() }))
    .query(({ input }) => {
      const settings = getPathSettings()
      return resolveGamePaths(input.gameId, settings)
    }),
})

/**
 * Profile mod management procedures
 * Handles actual file operations for installing/uninstalling mods to profiles
 */
const profilesRouter = t.router({
  /**
   * Install a mod to a profile
   * Copies extracted mod files from cache to the profile folder
   */
  installMod: publicProcedure
    .input(
      z.object({
        gameId: z.string(),
        profileId: z.string(),
        modId: z.string(),
        author: z.string(),
        name: z.string(),
        version: z.string(),
        extractedPath: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const settings = getPathSettings()
      const paths = resolveGamePaths(input.gameId, settings)
      const profileRoot = `${paths.profilesRoot}/${input.profileId}`
      
      const result = await installModToProfile(
        input.extractedPath,
        profileRoot,
        `${input.author}-${input.name}`
      )
      
      return {
        success: true,
        ...result,
      }
    }),
  
  /**
   * Uninstall a mod from a profile
   * Removes the mod's plugin folder from the profile
   */
  uninstallMod: publicProcedure
    .input(
      z.object({
        gameId: z.string(),
        profileId: z.string(),
        modId: z.string(),
        author: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const settings = getPathSettings()
      const paths = resolveGamePaths(input.gameId, settings)
      const profileRoot = `${paths.profilesRoot}/${input.profileId}`
      
      const filesRemoved = await uninstallModFromProfile(
        profileRoot,
        `${input.author}-${input.name}`
      )
      
      return {
        success: true,
        filesRemoved,
      }
    }),
  
  /**
   * Reset a profile by deleting its entire BepInEx folder
   * This removes all installed mods (plugins + config + everything)
   */
  resetProfile: publicProcedure
    .input(
      z.object({
        gameId: z.string(),
        profileId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const settings = getPathSettings()
      const paths = resolveGamePaths(input.gameId, settings)
      const profileRoot = `${paths.profilesRoot}/${input.profileId}`
      
      const filesRemoved = await resetProfileBepInEx(profileRoot)
      
      return {
        success: true,
        filesRemoved,
      }
    }),
})

/**
 * Game management procedures
 * Handles game-level operations like unmanaging (cleanup files)
 */
const gamesRouter = t.router({
  /**
   * Cleanup all files when un-managing a game
   * Deletes profiles, downloads, and caches for the game
   */
  unmanageGameCleanup: publicProcedure
    .input(
      z.object({
        gameId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const settings = getPathSettings()
      const paths = resolveGamePaths(input.gameId, settings)
      
      let profilesRemoved = 0
      let archivesRemoved = 0
      let cacheRemoved = 0
      
      // Delete all profiles for this game
      if (await pathExists(paths.profilesRoot)) {
        profilesRemoved = await countFilesInDir(paths.profilesRoot)
        await removeDir(paths.profilesRoot)
      }
      
      // Delete download archives and extracted cache
      const cacheResult = await deleteGameCaches(input.gameId, settings)
      archivesRemoved = cacheResult.archivesRemoved
      cacheRemoved = cacheResult.cacheRemoved
      
      return {
        success: true,
        profilesRemoved,
        archivesRemoved,
        cacheRemoved,
        totalRemoved: profilesRemoved + archivesRemoved + cacheRemoved,
      }
    }),
})

/**
 * Launch procedures
 * Handles game launching with BepInEx injection
 */
const launchRouter = t.router({
  /**
   * Verify game binary exists
   */
  verifyBinary: publicProcedure
    .input(
      z.object({
        installFolder: z.string(),
        exeNames: z.array(z.string()),
      })
    )
    .query(async ({ input }) => {
      return await verifyBinary(input.installFolder, input.exeNames)
    }),
  
  /**
   * Get launch status for a game
   * Returns whether the game is currently running and its PID
   */
  getStatus: publicProcedure
    .input(
      z.object({
        gameId: z.string(),
      })
    )
    .query(({ input }) => {
      return getProcessStatus(input.gameId)
    }),
  
  /**
   * Launch the game
   */
  start: publicProcedure
    .input(
      z.object({
        gameId: z.string(),
        profileId: z.string(),
        mode: z.enum(["modded", "vanilla"]),
        installFolder: z.string(),
        exePath: z.string(),
        launchParameters: z.string(),
        packageIndexUrl: z.string(),
        modloaderPackage: z.object({
          owner: z.string(),
          name: z.string(),
          rootFolder: z.string(),
        }).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const settings = getPathSettings()
      const paths = resolveGamePaths(input.gameId, settings)
      const profileRoot = `${paths.profilesRoot}/${input.profileId}`
      
      const result = await launchGame({
        gameId: input.gameId,
        profileId: input.profileId,
        mode: input.mode as LaunchMode,
        installFolder: input.installFolder,
        exePath: input.exePath,
        launchParameters: input.launchParameters,
        packageIndexUrl: input.packageIndexUrl,
        profileRoot,
        modloaderPackage: input.modloaderPackage,
      })
      
      return result
    }),
  
  /**
   * Cleanup injected files from game install folder
   */
  cleanupInjected: publicProcedure
    .input(
      z.object({
        gameId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await cleanupInjected(input.gameId)
    }),
  
  /**
   * Check if base dependencies are installed for a profile
   */
  checkBaseDependencies: publicProcedure
    .input(
      z.object({
        gameId: z.string(),
        profileId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const settings = getPathSettings()
      const paths = resolveGamePaths(input.gameId, settings)
      const profileRoot = `${paths.profilesRoot}/${input.profileId}`
      
      return await checkBaseDependencies(profileRoot)
    }),
  
  /**
   * Install base dependencies for a profile
   */
  installBaseDependencies: publicProcedure
    .input(
      z.object({
        gameId: z.string(),
        profileId: z.string(),
        packageIndexUrl: z.string(),
        modloaderPackage: z.object({
          owner: z.string(),
          name: z.string(),
          rootFolder: z.string(),
        }).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const settings = getPathSettings()
      const paths = resolveGamePaths(input.gameId, settings)
      const profileRoot = `${paths.profilesRoot}/${input.profileId}`
      
      return await installBaseDependencies(
        input.gameId,
        profileRoot,
        input.packageIndexUrl,
        input.modloaderPackage
      )
    }),
})

/**
 * Logging procedures
 * Handles application logging and diagnostics
 */
const logsRouter = t.router({
  /**
   * Get recent log entries
   * Returns the last N lines from the log file
   */
  getRecentLogs: publicProcedure
    .input(
      z.object({
        lineCount: z.number().optional().default(100),
      })
    )
    .query(async ({ input }) => {
      const logger = getLogger()
      return await logger.getRecentLogs(input.lineCount)
    }),
  
  /**
   * Get full log contents
   * Returns the entire log file contents
   */
  getFullLogs: publicProcedure
    .query(async () => {
      const logger = getLogger()
      return await logger.getLogContents()
    }),
  
  /**
   * Get log file path
   * Returns the absolute path to the log file
   */
  getLogFilePath: publicProcedure
    .query(() => {
      const logger = getLogger()
      return logger.getLogFilePath()
    }),
  
  /**
   * Get troubleshooting information
   * Returns system info, app version, and other diagnostic data
   */
  getTroubleshootingInfo: publicProcedure
    .query(() => {
      const logger = getLogger()
      const info = {
        appVersion: app.getVersion(),
        appName: app.getName(),
        platform: process.platform,
        arch: process.arch,
        electronVersion: process.versions.electron,
        chromeVersion: process.versions.chrome,
        nodeVersion: process.versions.node,
        userDataPath: app.getPath("userData"),
        logsPath: logger.getLogFilePath(),
        timestamp: new Date().toISOString(),
      }
      
      return info
    }),
})

/**
 * Config file management procedures
 * Manages config files within the active profile folder
 */
const configRouter = t.router({
  /**
   * List all config files in the active profile
   * Returns array of config file metadata
   */
  list: publicProcedure
    .input(
      z.object({
        gameId: z.string(),
        profileId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const settings = getPathSettings()
      const paths = resolveGamePaths(input.gameId, settings)
      const profileRoot = join(paths.profilesRoot, input.profileId)
      
      // Check if profile exists
      if (!(await pathExists(profileRoot))) {
        return []
      }
      
      const files: Array<{
        relativePath: string
        name: string
        ext: string
        mtimeMs: number
        size: number
        kind: "file"
        group: string
      }> = []
      
      // Allowed extensions
      const allowedExts = new Set([".cfg", ".txt", ".json", ".yml", ".yaml", ".ini"])
      
      // Directories to skip
      const skipDirs = new Set(["_state", "dotnet"])
      
      // Recursive file walker
      async function walk(dir: string, relativeTo: string) {
        try {
          const entries = await fs.readdir(dir, { withFileTypes: true })
          
          for (const entry of entries) {
            const fullPath = join(dir, entry.name)
            const relPath = join(relativeTo, entry.name)
            
            if (entry.isDirectory()) {
              // Skip excluded directories
              if (skipDirs.has(entry.name)) {
                continue
              }
              // Recurse
              await walk(fullPath, relPath)
            } else if (entry.isFile()) {
              const ext = entry.name.substring(entry.name.lastIndexOf(".")).toLowerCase()
              
              // Skip plugin manifest.json files
              if (relPath.includes("BepInEx\\plugins") && entry.name === "manifest.json") {
                continue
              }
              
              // Include if extension is allowed or if it's doorstop_config.ini
              if (allowedExts.has(ext) || entry.name === "doorstop_config.ini") {
                const stat = await fs.stat(fullPath)
                
                // Determine group by path
                let group = "other"
                if (relPath.startsWith("BepInEx\\config")) {
                  group = "BepInEx/config"
                } else if (entry.name === "doorstop_config.ini") {
                  group = "profile root"
                }
                
                files.push({
                  relativePath: relPath,
                  name: entry.name,
                  ext,
                  mtimeMs: stat.mtimeMs,
                  size: stat.size,
                  kind: "file",
                  group,
                })
              }
            }
          }
        } catch (error) {
          // Silently skip directories we can't read
          console.error(`Error reading directory ${dir}:`, error)
        }
      }
      
      await walk(profileRoot, "")
      
      // Sort by name
      files.sort((a, b) => a.name.localeCompare(b.name))
      
      return files
    }),
  
  /**
   * Read a config file's text content
   */
  read: publicProcedure
    .input(
      z.object({
        gameId: z.string(),
        profileId: z.string(),
        relativePath: z.string(),
      })
    )
    .query(async ({ input }) => {
      const settings = getPathSettings()
      const paths = resolveGamePaths(input.gameId, settings)
      const profileRoot = join(paths.profilesRoot, input.profileId)
      
      // Security: validate path is safe
      const { isPathSafe } = await import("../downloads/fs-utils")
      if (!isPathSafe(profileRoot, input.relativePath)) {
        throw new Error("Invalid path: attempts to escape profile directory")
      }
      
      const absPath = join(profileRoot, input.relativePath)
      
      try {
        const text = await fs.readFile(absPath, "utf8")
        return { text }
      } catch (error: unknown) {
        if (error instanceof Error && "code" in error) {
          if (error.code === "ENOENT") {
            throw new Error("File not found")
          }
          if (error.code === "EACCES") {
            throw new Error("Permission denied")
          }
        }
        throw error
      }
    }),
  
  /**
   * Write (or overwrite) a config file atomically
   */
  write: publicProcedure
    .input(
      z.object({
        gameId: z.string(),
        profileId: z.string(),
        relativePath: z.string(),
        text: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const settings = getPathSettings()
      const paths = resolveGamePaths(input.gameId, settings)
      const profileRoot = join(paths.profilesRoot, input.profileId)
      
      // Security: validate path is safe
      const { isPathSafe, atomicWrite } = await import("../downloads/fs-utils")
      if (!isPathSafe(profileRoot, input.relativePath)) {
        throw new Error("Invalid path: attempts to escape profile directory")
      }
      
      const absPath = join(profileRoot, input.relativePath)
      
      try {
        await atomicWrite(absPath, input.text)
        return { ok: true }
      } catch (error: unknown) {
        if (error instanceof Error && "code" in error) {
          if (error.code === "EACCES") {
            throw new Error("Permission denied")
          }
        }
        throw error
      }
    }),
  
  /**
   * Delete a config file
   */
  delete: publicProcedure
    .input(
      z.object({
        gameId: z.string(),
        profileId: z.string(),
        relativePath: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const settings = getPathSettings()
      const paths = resolveGamePaths(input.gameId, settings)
      const profileRoot = join(paths.profilesRoot, input.profileId)
      
      // Security: validate path is safe
      const { isPathSafe } = await import("../downloads/fs-utils")
      if (!isPathSafe(profileRoot, input.relativePath)) {
        throw new Error("Invalid path: attempts to escape profile directory")
      }
      
      const absPath = join(profileRoot, input.relativePath)
      
      try {
        await fs.unlink(absPath)
        return { ok: true }
      } catch (error: unknown) {
        if (error instanceof Error && "code" in error) {
          if (error.code === "ENOENT") {
            throw new Error("File not found")
          }
          if (error.code === "EACCES") {
            throw new Error("Permission denied")
          }
        }
        throw error
      }
    }),
  
  /**
   * Reveal a config file in the system file explorer
   * Opens the containing folder
   */
  reveal: publicProcedure
    .input(
      z.object({
        gameId: z.string(),
        profileId: z.string(),
        relativePath: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const settings = getPathSettings()
      const paths = resolveGamePaths(input.gameId, settings)
      const profileRoot = join(paths.profilesRoot, input.profileId)
      
      // Security: validate path is safe
      const { isPathSafe } = await import("../downloads/fs-utils")
      if (!isPathSafe(profileRoot, input.relativePath)) {
        throw new Error("Invalid path: attempts to escape profile directory")
      }
      
      const absPath = join(profileRoot, input.relativePath)
      
      // Open the containing folder
      await shell.openPath(join(absPath, ".."))
      
      return { ok: true }
    }),
  
  /**
   * Open a config file in the default system editor
   */
  open: publicProcedure
    .input(
      z.object({
        gameId: z.string(),
        profileId: z.string(),
        relativePath: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const settings = getPathSettings()
      const paths = resolveGamePaths(input.gameId, settings)
      const profileRoot = join(paths.profilesRoot, input.profileId)
      
      // Security: validate path is safe
      const { isPathSafe } = await import("../downloads/fs-utils")
      if (!isPathSafe(profileRoot, input.relativePath)) {
        throw new Error("Invalid path: attempts to escape profile directory")
      }
      
      const absPath = join(profileRoot, input.relativePath)
      
      // Open the file
      await shell.openPath(absPath)
      
      return { ok: true }
    }),
})

/**
 * Helper to count files in a directory
 */
async function countFilesInDir(dirPath: string): Promise<number> {
  let count = 0
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name)
      if (entry.isDirectory()) {
        count += await countFilesInDir(fullPath)
      } else {
        count++
      }
    }
  } catch {
    return 0
  }
  
  return count
}

/**
 * Check if a path exists
 */
async function pathExists(path: string): Promise<boolean> {
  try {
    await fs.access(path)
    return true
  } catch {
    return false
  }
}

/**
 * Recursively removes a directory
 */
async function removeDir(dirPath: string): Promise<void> {
  await fs.rm(dirPath, { recursive: true, force: true })
}

/**
 * Main application router
 * Organize procedures by domain/feature
 */
export const appRouter = t.router({
  desktop: desktopRouter,
  thunderstore: thunderstoreRouter,
  downloads: downloadsRouter,
  profiles: profilesRouter,
  games: gamesRouter,
  launch: launchRouter,
  logs: logsRouter,
  config: configRouter,
  data: dataRouter,
})

/**
 * Export type for use in renderer
 * This is a type-only export, no runtime code
 */
export type AppRouter = typeof appRouter
