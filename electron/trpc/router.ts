import { initTRPC } from "@trpc/server"
import { dialog, shell } from "electron"
import superjson from "superjson"
import { z } from "zod"
import type { AppContext } from "./context"
import { searchPackages, getPackage } from "../thunderstore/search"

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
})

/**
 * Main application router
 * Organize procedures by domain/feature
 */
export const appRouter = t.router({
  desktop: desktopRouter,
  thunderstore: thunderstoreRouter,
})

/**
 * Export type for use in renderer
 * This is a type-only export, no runtime code
 */
export type AppRouter = typeof appRouter
