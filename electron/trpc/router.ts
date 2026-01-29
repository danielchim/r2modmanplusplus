import { initTRPC } from "@trpc/server"
import { dialog, shell } from "electron"
import superjson from "superjson"
import { z } from "zod"
import type { AppContext } from "./context"

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
 * Main application router
 * Organize procedures by domain/feature
 */
export const appRouter = t.router({
  desktop: desktopRouter,
})

/**
 * Export type for use in renderer
 * This is a type-only export, no runtime code
 */
export type AppRouter = typeof appRouter
