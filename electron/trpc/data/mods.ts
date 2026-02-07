import { z } from "zod"
import { t, publicProcedure } from "../trpc"
import { getDb } from "../../db"
import { profileMod } from "../../db/schema"
import { eq, and, sql } from "drizzle-orm"

type InstalledMod = {
  modId: string
  installedVersion: string
  enabled: boolean
  dependencyWarnings: string[]
}

function parseWarnings(raw: string | null): string[] {
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export const dataModsRouter = t.router({
  /** List all installed mods for a profile */
  listInstalled: publicProcedure
    .input(z.object({ profileId: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = getDb()
      const rows = await db
        .select()
        .from(profileMod)
        .where(eq(profileMod.profileId, input.profileId))
      return rows.map((r): InstalledMod => ({
        modId: r.modId,
        installedVersion: r.installedVersion,
        enabled: r.enabled,
        dependencyWarnings: parseWarnings(r.dependencyWarnings),
      }))
    }),

  /** Check if a specific mod is installed */
  isInstalled: publicProcedure
    .input(z.object({
      profileId: z.string().min(1),
      modId: z.string().min(1),
    }))
    .query(async ({ input }) => {
      const db = getDb()
      const rows = await db
        .select({ id: profileMod.id })
        .from(profileMod)
        .where(and(eq(profileMod.profileId, input.profileId), eq(profileMod.modId, input.modId)))
        .limit(1)
      return !!rows[0]
    }),

  /** Check if a mod is enabled */
  isEnabled: publicProcedure
    .input(z.object({
      profileId: z.string().min(1),
      modId: z.string().min(1),
    }))
    .query(async ({ input }) => {
      const db = getDb()
      const rows = await db
        .select({ enabled: profileMod.enabled })
        .from(profileMod)
        .where(and(eq(profileMod.profileId, input.profileId), eq(profileMod.modId, input.modId)))
        .limit(1)
      return rows[0]?.enabled ?? false
    }),

  /** Get the installed version of a mod */
  getInstalledVersion: publicProcedure
    .input(z.object({
      profileId: z.string().min(1),
      modId: z.string().min(1),
    }))
    .query(async ({ input }) => {
      const db = getDb()
      const rows = await db
        .select({ installedVersion: profileMod.installedVersion })
        .from(profileMod)
        .where(and(eq(profileMod.profileId, input.profileId), eq(profileMod.modId, input.modId)))
        .limit(1)
      return rows[0]?.installedVersion as string | undefined
    }),

  /** Get dependency warnings for a mod */
  getDependencyWarnings: publicProcedure
    .input(z.object({
      profileId: z.string().min(1),
      modId: z.string().min(1),
    }))
    .query(async ({ input }) => {
      const db = getDb()
      const rows = await db
        .select({ dependencyWarnings: profileMod.dependencyWarnings })
        .from(profileMod)
        .where(and(eq(profileMod.profileId, input.profileId), eq(profileMod.modId, input.modId)))
        .limit(1)
      return parseWarnings(rows[0]?.dependencyWarnings ?? null)
    }),

  /** Record a mod as installed (upsert) */
  install: publicProcedure
    .input(z.object({
      profileId: z.string().min(1),
      modId: z.string().min(1),
      version: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const db = getDb()
      await db
        .insert(profileMod)
        .values({
          profileId: input.profileId,
          modId: input.modId,
          installedVersion: input.version,
          enabled: true,
        })
        .onConflictDoUpdate({
          target: [profileMod.profileId, profileMod.modId],
          set: { installedVersion: input.version, enabled: true },
        })
    }),

  /** Remove a mod record from a profile */
  uninstall: publicProcedure
    .input(z.object({
      profileId: z.string().min(1),
      modId: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const db = getDb()
      await db
        .delete(profileMod)
        .where(and(eq(profileMod.profileId, input.profileId), eq(profileMod.modId, input.modId)))
    }),

  /** Remove all mod records from a profile. Returns count removed. */
  uninstallAll: publicProcedure
    .input(z.object({ profileId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const db = getDb()
      const deleted = await db
        .delete(profileMod)
        .where(eq(profileMod.profileId, input.profileId))
        .returning()
      return deleted.length
    }),

  /** Enable a mod */
  enable: publicProcedure
    .input(z.object({
      profileId: z.string().min(1),
      modId: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const db = getDb()
      await db
        .update(profileMod)
        .set({ enabled: true })
        .where(and(eq(profileMod.profileId, input.profileId), eq(profileMod.modId, input.modId)))
    }),

  /** Disable a mod */
  disable: publicProcedure
    .input(z.object({
      profileId: z.string().min(1),
      modId: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const db = getDb()
      await db
        .update(profileMod)
        .set({ enabled: false })
        .where(and(eq(profileMod.profileId, input.profileId), eq(profileMod.modId, input.modId)))
    }),

  /** Toggle mod enabled state */
  toggle: publicProcedure
    .input(z.object({
      profileId: z.string().min(1),
      modId: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const db = getDb()
      await db
        .update(profileMod)
        .set({ enabled: sql`NOT ${profileMod.enabled}` })
        .where(and(eq(profileMod.profileId, input.profileId), eq(profileMod.modId, input.modId)))
    }),

  /** Set dependency warnings for a mod */
  setDependencyWarnings: publicProcedure
    .input(z.object({
      profileId: z.string().min(1),
      modId: z.string().min(1),
      warnings: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      const db = getDb()
      await db
        .update(profileMod)
        .set({ dependencyWarnings: JSON.stringify(input.warnings) })
        .where(and(eq(profileMod.profileId, input.profileId), eq(profileMod.modId, input.modId)))
    }),

  /** Clear dependency warnings for a mod */
  clearDependencyWarnings: publicProcedure
    .input(z.object({
      profileId: z.string().min(1),
      modId: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const db = getDb()
      await db
        .update(profileMod)
        .set({ dependencyWarnings: null })
        .where(and(eq(profileMod.profileId, input.profileId), eq(profileMod.modId, input.modId)))
    }),

  /** Delete all mod state for a profile */
  deleteProfileState: publicProcedure
    .input(z.object({ profileId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const db = getDb()
      await db.delete(profileMod).where(eq(profileMod.profileId, input.profileId))
    }),
})
