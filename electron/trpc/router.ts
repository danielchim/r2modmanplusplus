import { initTRPC } from "@trpc/server"
import { dialog, shell } from "electron"
import { promises as fs } from "fs"
import { join } from "path"
import superjson from "superjson"
import { z } from "zod"
import type { AppContext } from "./context"
import { searchPackages, getPackage } from "../thunderstore/search"
import { resolveDependencies } from "../thunderstore/dependencies"
import { clearCatalog, closeAllCatalogs } from "../thunderstore/catalog"
import { getDownloadManager } from "../downloads/manager"
import { setPathSettings, getPathSettings } from "../downloads/settings-state"
import { resolveGamePaths } from "../downloads/path-resolver"
import { installModToProfile, uninstallModFromProfile, resetProfileBepInEx, deleteGameCaches } from "../profiles/mod-installer"

/**
 * Initialize tRPC with SuperJSON for rich data serialization
 * (Date, Map, Set, BigInt, etc.)
 */
const t = initTRPC.context<AppContext>().create({
  isServer: true,
  transformer: superjson,
})

/**
 * Base procedure - all procedures inherit from this
 */
const publicProcedure = t.procedure

/**
 * Desktop/filesystem procedures
 * Migrated from existing ipcMain handlers
 */
const desktopRouter = t.router({
  /**
   * Open native folder selection dialog
   * Returns selected folder path or null if cancelled
   */
  selectFolder: publicProcedure.query(async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
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
  } catch (error) {
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
})

/**
 * Export type for use in renderer
 * This is a type-only export, no runtime code
 */
export type AppRouter = typeof appRouter
