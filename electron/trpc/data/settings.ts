import { z } from "zod"
import { t, publicProcedure } from "../trpc"
import { getDb } from "../../db"
import { globalSettings, gameSettings } from "../../db/schema"
import { eq } from "drizzle-orm"
import { isoToEpoch } from "./games"

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

/** Ensure global settings row exists and return it */
async function ensureGlobalRow(): Promise<GlobalSettings> {
  const db = getDb()
  const rows = await db.select().from(globalSettings).where(eq(globalSettings.id, 1)).limit(1)
  if (rows[0]) {
    return rowToGlobalSettings(rows[0])
  }
  await db.insert(globalSettings).values({ id: 1 }).onConflictDoNothing()
  const inserted = await db.select().from(globalSettings).where(eq(globalSettings.id, 1)).limit(1)
  return inserted[0] ? rowToGlobalSettings(inserted[0]) : defaultGlobal
}

function rowToGlobalSettings(r: typeof globalSettings.$inferSelect): GlobalSettings {
  return {
    dataFolder: r.dataFolder,
    steamFolder: r.steamFolder,
    modDownloadFolder: r.modDownloadFolder,
    cacheFolder: r.cacheFolder,
    speedLimitEnabled: r.speedLimitEnabled,
    speedLimitBps: r.speedLimitBps,
    speedUnit: r.speedUnit as GlobalSettings["speedUnit"],
    maxConcurrentDownloads: r.maxConcurrentDownloads,
    downloadCacheEnabled: r.downloadCacheEnabled,
    preferredThunderstoreCdn: r.preferredThunderstoreCdn,
    autoInstallMods: r.autoInstallMods,
    enforceDependencyVersions: r.enforceDependencyVersions,
    cardDisplayType: r.cardDisplayType as GlobalSettings["cardDisplayType"],
    theme: r.theme as GlobalSettings["theme"],
    language: r.language,
    funkyMode: r.funkyMode,
  }
}

function rowToGameSettings(r: typeof gameSettings.$inferSelect): GameSettings {
  return {
    gameInstallFolder: r.gameInstallFolder,
    modDownloadFolder: r.modDownloadFolder ?? "",
    cacheFolder: r.cacheFolder ?? "",
    modCacheFolder: r.modCacheFolder,
    launchParameters: r.launchParameters,
    onlineModListCacheDate: isoToEpoch(r.onlineModListCacheDate),
  }
}

export const dataSettingsRouter = t.router({
  /** Get global settings (singleton row, id=1) */
  getGlobal: publicProcedure.query(async () => {
    return ensureGlobalRow()
  }),

  /** Get raw per-game settings */
  getForGame: publicProcedure
    .input(z.object({ gameId: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = getDb()
      const rows = await db
        .select()
        .from(gameSettings)
        .where(eq(gameSettings.gameId, input.gameId))
        .limit(1)
      if (!rows[0]) return defaultGameSettings
      return rowToGameSettings(rows[0])
    }),

  /** Get effective game settings (per-game merged with global fallbacks) */
  getEffective: publicProcedure
    .input(z.object({ gameId: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = getDb()
      const global = await ensureGlobalRow()
      const rows = await db
        .select()
        .from(gameSettings)
        .where(eq(gameSettings.gameId, input.gameId))
        .limit(1)
      const perGame = rows[0]

      if (!perGame) {
        return {
          ...defaultGameSettings,
          modDownloadFolder: global.modDownloadFolder,
          cacheFolder: global.cacheFolder,
        } as EffectiveGameSettings
      }

      return {
        gameInstallFolder: perGame.gameInstallFolder,
        modDownloadFolder: perGame.modDownloadFolder ?? global.modDownloadFolder,
        cacheFolder: perGame.cacheFolder ?? global.cacheFolder,
        modCacheFolder: perGame.modCacheFolder,
        launchParameters: perGame.launchParameters,
        onlineModListCacheDate: isoToEpoch(perGame.onlineModListCacheDate),
      } as EffectiveGameSettings
    }),

  /** Partial update of global settings */
  updateGlobal: publicProcedure
    .input(z.object({ updates: globalSettingsPartialSchema }))
    .mutation(async ({ input }) => {
      const db = getDb()
      // Ensure row exists first
      await db.insert(globalSettings).values({ id: 1 }).onConflictDoNothing()
      await db
        .update(globalSettings)
        .set(input.updates)
        .where(eq(globalSettings.id, 1))
    }),

  /** Partial update of per-game settings (upsert) */
  updateForGame: publicProcedure
    .input(z.object({
      gameId: z.string().min(1),
      updates: gameSettingsPartialSchema,
    }))
    .mutation(async ({ input }) => {
      const db = getDb()
      // Convert epoch ms back to ISO for storage
      const updates: Record<string, unknown> = { ...input.updates }
      if (input.updates.onlineModListCacheDate !== undefined) {
        updates.onlineModListCacheDate = input.updates.onlineModListCacheDate != null
          ? new Date(input.updates.onlineModListCacheDate).toISOString()
          : null
      }
      await db
        .insert(gameSettings)
        .values({ gameId: input.gameId, ...updates })
        .onConflictDoUpdate({
          target: gameSettings.gameId,
          set: updates,
        })
    }),

  /** Reset per-game settings to defaults (keeps row, nulls overridable fields) */
  resetForGame: publicProcedure
    .input(z.object({ gameId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const db = getDb()
      await db
        .update(gameSettings)
        .set({
          modDownloadFolder: null,
          cacheFolder: null,
          gameInstallFolder: "",
          modCacheFolder: "",
          launchParameters: "",
          onlineModListCacheDate: null,
        })
        .where(eq(gameSettings.gameId, input.gameId))
    }),

  /** Delete per-game settings row entirely */
  deleteForGame: publicProcedure
    .input(z.object({ gameId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const db = getDb()
      await db.delete(gameSettings).where(eq(gameSettings.gameId, input.gameId))
    }),
})
