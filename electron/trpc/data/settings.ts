import { z } from "zod"
import { t, publicProcedure } from "../trpc"

// ---------------------------------------------------------------------------
// Zod schemas for partial updates
// ---------------------------------------------------------------------------

const globalSettingsPartialSchema = z.object({
  dataFolder: z.string().optional(),
  steamFolder: z.string().optional(),
  modDownloadFolder: z.string().optional(),
  cacheFolder: z.string().optional(),
  speedLimitEnabled: z.boolean().optional(),
  speedLimitBps: z.number().int().optional(),
  speedUnit: z.enum(["Bps", "bps"]).optional(),
  maxConcurrentDownloads: z.number().int().positive().optional(),
  downloadCacheEnabled: z.boolean().optional(),
  preferredThunderstoreCdn: z.string().optional(),
  autoInstallMods: z.boolean().optional(),
  enforceDependencyVersions: z.boolean().optional(),
  cardDisplayType: z.enum(["collapsed", "expanded"]).optional(),
  theme: z.enum(["dark", "light", "system"]).optional(),
  language: z.string().optional(),
  funkyMode: z.boolean().optional(),
})

const gameSettingsPartialSchema = z.object({
  gameInstallFolder: z.string().optional(),
  modDownloadFolder: z.string().optional(),
  cacheFolder: z.string().optional(),
  modCacheFolder: z.string().optional(),
  launchParameters: z.string().optional(),
  onlineModListCacheDate: z.number().nullable().optional(),
})

// ---------------------------------------------------------------------------
// Full shape types (for return values)
// ---------------------------------------------------------------------------

type GlobalSettings = {
  dataFolder: string
  steamFolder: string
  modDownloadFolder: string
  cacheFolder: string
  speedLimitEnabled: boolean
  speedLimitBps: number
  speedUnit: "Bps" | "bps"
  maxConcurrentDownloads: number
  downloadCacheEnabled: boolean
  preferredThunderstoreCdn: string
  autoInstallMods: boolean
  enforceDependencyVersions: boolean
  cardDisplayType: "collapsed" | "expanded"
  theme: "dark" | "light" | "system"
  language: string
  funkyMode: boolean
}

type GameSettings = {
  gameInstallFolder: string
  modDownloadFolder: string
  cacheFolder: string
  modCacheFolder: string
  launchParameters: string
  onlineModListCacheDate: number | null
}

type EffectiveGameSettings = GameSettings & {
  modDownloadFolder: string
  cacheFolder: string
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

const defaultGlobal: GlobalSettings = {
  dataFolder: "",
  steamFolder: "",
  modDownloadFolder: "",
  cacheFolder: "",
  speedLimitEnabled: false,
  speedLimitBps: 0,
  speedUnit: "Bps",
  maxConcurrentDownloads: 3,
  downloadCacheEnabled: true,
  preferredThunderstoreCdn: "main",
  autoInstallMods: true,
  enforceDependencyVersions: true,
  cardDisplayType: "collapsed",
  theme: "dark",
  language: "en",
  funkyMode: false,
}

const defaultGameSettings: GameSettings = {
  gameInstallFolder: "",
  modDownloadFolder: "",
  cacheFolder: "",
  modCacheFolder: "",
  launchParameters: "",
  onlineModListCacheDate: null,
}

export const dataSettingsRouter = t.router({
  /** Get global settings (singleton row, id=1) */
  getGlobal: publicProcedure.query(async () => {
    // TODO: select from globalSettings where id = 1
    //       if no row, insert default and return it
    return defaultGlobal as GlobalSettings
  }),

  /** Get raw per-game settings */
  getForGame: publicProcedure
    .input(z.object({ gameId: z.string().min(1) }))
    .query(async ({ input }) => {
      // TODO: select from gameSettings where gameId = input.gameId
      //       if no row, return defaults
      void input
      return defaultGameSettings as GameSettings
    }),

  /** Get effective game settings (per-game merged with global fallbacks) */
  getEffective: publicProcedure
    .input(z.object({ gameId: z.string().min(1) }))
    .query(async ({ input }) => {
      // TODO:
      //   1. fetch global settings (id=1)
      //   2. fetch per-game settings (gameId)
      //   3. merge: modDownloadFolder = perGame || global, cacheFolder = perGame || global
      void input
      return defaultGameSettings as EffectiveGameSettings
    }),

  /** Partial update of global settings */
  updateGlobal: publicProcedure
    .input(z.object({ updates: globalSettingsPartialSchema }))
    .mutation(async ({ input }) => {
      // TODO: update globalSettings set ...input.updates where id = 1
      void input
    }),

  /** Partial update of per-game settings (upsert) */
  updateForGame: publicProcedure
    .input(z.object({
      gameId: z.string().min(1),
      updates: gameSettingsPartialSchema,
    }))
    .mutation(async ({ input }) => {
      // TODO: upsert into gameSettings
      //       on conflict (gameId) do update set ...input.updates
      void input
    }),

  /** Reset per-game settings to defaults (keeps row, nulls overridable fields) */
  resetForGame: publicProcedure
    .input(z.object({ gameId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      // TODO: update gameSettings set modDownloadFolder=null, cacheFolder=null,
      //       gameInstallFolder='', modCacheFolder='', launchParameters='',
      //       onlineModListCacheDate=null where gameId = input.gameId
      void input
    }),

  /** Delete per-game settings row entirely */
  deleteForGame: publicProcedure
    .input(z.object({ gameId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      // TODO: delete from gameSettings where gameId = input.gameId
      void input
    }),
})
