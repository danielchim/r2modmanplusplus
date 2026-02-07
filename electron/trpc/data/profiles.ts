import { z } from "zod"
import { t, publicProcedure } from "../trpc"
import { getDb } from "../../db"
import { profile } from "../../db/schema"
import { eq, and, asc } from "drizzle-orm"
import { randomUUID } from "crypto"
import { isoToEpoch } from "./games"
import { getLogger } from "../../file-logger"

type Profile = {
  id: string
  name: string
  createdAt: number
}

function rowToProfile(r: typeof profile.$inferSelect): Profile {
  return {
    id: r.id,
    name: r.name,
    createdAt: isoToEpoch(r.createdAt) ?? Date.now(),
  }
}

/**
 * Resolves the active profile ID for a game, with fallback to default profile.
 * Returns profileId or null if neither exists.
 */
export async function resolveActiveProfileId(gameId: string): Promise<string | null> {
  const db = getDb()
  const logger = getLogger()
  
  logger.debug(`[resolveActiveProfileId] Resolving for game: ${gameId}`)
  
  // First try active profile
  const activeRows = await db
    .select({ id: profile.id })
    .from(profile)
    .where(and(eq(profile.gameId, gameId), eq(profile.isActive, true)))
    .limit(1)
  
  if (activeRows[0]) {
    logger.info(`[resolveActiveProfileId] ✓ Found active profile: ${activeRows[0].id}`)
    return activeRows[0].id
  }
  
  logger.debug(`[resolveActiveProfileId] No active profile found, trying default...`)
  
  // Fall back to default profile
  const defaultRows = await db
    .select({ id: profile.id })
    .from(profile)
    .where(and(eq(profile.gameId, gameId), eq(profile.isDefault, true)))
    .limit(1)
  
  if (defaultRows[0]) {
    logger.info(`[resolveActiveProfileId] ✓ Found default profile: ${defaultRows[0].id}`)
    return defaultRows[0].id
  }
  
  logger.error(`[resolveActiveProfileId] ❌ No active or default profile exists for game: ${gameId}`)
  
  // List all profiles for this game for debugging
  const allProfiles = await db
    .select({ id: profile.id, name: profile.name, isActive: profile.isActive, isDefault: profile.isDefault })
    .from(profile)
    .where(eq(profile.gameId, gameId))
  
  logger.error(`[resolveActiveProfileId] Total profiles for this game: ${allProfiles.length}`)
  if (allProfiles.length > 0) {
    logger.error(`[resolveActiveProfileId] Profiles:`, { profiles: allProfiles })
  }
  
  return null
}

export const dataProfilesRouter = t.router({
  /** List all profiles for a game */
  list: publicProcedure
    .input(z.object({ gameId: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = getDb()
      const rows = await db
        .select()
        .from(profile)
        .where(eq(profile.gameId, input.gameId))
        .orderBy(asc(profile.createdAt))
      return rows.map(rowToProfile)
    }),

  /** Get the active profile for a game, or null */
  getActive: publicProcedure
    .input(z.object({ gameId: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = getDb()
      const rows = await db
        .select()
        .from(profile)
        .where(and(eq(profile.gameId, input.gameId), eq(profile.isActive, true)))
        .limit(1)
      const r = rows[0]
      return r ? rowToProfile(r) : null
    }),

  /** Ensure a default profile exists for a game. Returns the default profile id. */
  ensureDefault: publicProcedure
    .input(z.object({ gameId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const db = getDb()
      const defaultId = `${input.gameId}-default`

      return await db.transaction(async (tx) => {
        // Check if default profile exists
        const existing = await tx
          .select()
          .from(profile)
          .where(eq(profile.id, defaultId))
          .limit(1)

        if (!existing[0]) {
          await tx.insert(profile).values({
            id: defaultId,
            gameId: input.gameId,
            name: "Default",
            isDefault: true,
            isActive: false,
          })
        }

        // If no active profile for this game, set default as active
        const active = await tx
          .select()
          .from(profile)
          .where(and(eq(profile.gameId, input.gameId), eq(profile.isActive, true)))
          .limit(1)

        if (!active[0]) {
          await tx.update(profile).set({ isActive: true }).where(eq(profile.id, defaultId))
        }

        return defaultId
      })
    }),

  /** Create a new profile and set it as active */
  create: publicProcedure
    .input(z.object({
      gameId: z.string().min(1),
      name: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const db = getDb()
      const newId = `${input.gameId}-${randomUUID()}`

      return await db.transaction(async (tx) => {
        // Deactivate current active profile
        await tx
          .update(profile)
          .set({ isActive: false })
          .where(and(eq(profile.gameId, input.gameId), eq(profile.isActive, true)))

        // Insert new profile as active
        const now = new Date().toISOString()
        await tx.insert(profile).values({
          id: newId,
          gameId: input.gameId,
          name: input.name,
          isDefault: false,
          isActive: true,
          createdAt: now,
        })

        return {
          id: newId,
          name: input.name,
          createdAt: new Date(now).getTime(),
        } as Profile
      })
    }),

  /** Rename a profile */
  rename: publicProcedure
    .input(z.object({
      gameId: z.string().min(1),
      profileId: z.string().min(1),
      newName: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const db = getDb()
      await db
        .update(profile)
        .set({ name: input.newName })
        .where(and(eq(profile.id, input.profileId), eq(profile.gameId, input.gameId)))
    }),

  /** Remove a profile. Returns { deleted, reason? }. */
  remove: publicProcedure
    .input(z.object({
      gameId: z.string().min(1),
      profileId: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const db = getDb()

      return await db.transaction(async (tx) => {
        // Check if it's the default profile
        const target = await tx
          .select()
          .from(profile)
          .where(and(eq(profile.id, input.profileId), eq(profile.gameId, input.gameId)))
          .limit(1)

        if (!target[0]) {
          return { deleted: false as boolean, reason: "Profile not found" as string | undefined }
        }

        if (target[0].isDefault) {
          return { deleted: false as boolean, reason: "Cannot delete default profile" as string | undefined }
        }

        // If this profile is active, reassign active to default or another profile
        if (target[0].isActive) {
          const defaultId = `${input.gameId}-default`
          // Try default profile first
          const defaultProfile = await tx
            .select()
            .from(profile)
            .where(eq(profile.id, defaultId))
            .limit(1)

          if (defaultProfile[0]) {
            await tx.update(profile).set({ isActive: true }).where(eq(profile.id, defaultId))
          } else {
            // Fall back to any other profile
            const other = await tx
              .select()
              .from(profile)
              .where(and(
                eq(profile.gameId, input.gameId),
                eq(profile.isActive, false),
              ))
              .limit(1)
            if (other[0]) {
              await tx.update(profile).set({ isActive: true }).where(eq(profile.id, other[0].id))
            }
          }
        }

        // Delete the profile (cascade deletes profileMod rows)
        await tx.delete(profile).where(eq(profile.id, input.profileId))
        return { deleted: true as boolean, reason: undefined as string | undefined }
      })
    }),

  /** Set a profile as active for its game */
  setActive: publicProcedure
    .input(z.object({
      gameId: z.string().min(1),
      profileId: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const db = getDb()
      await db.transaction(async (tx) => {
        // Deactivate all profiles for this game
        await tx
          .update(profile)
          .set({ isActive: false })
          .where(and(eq(profile.gameId, input.gameId), eq(profile.isActive, true)))
        // Activate target
        await tx
          .update(profile)
          .set({ isActive: true })
          .where(eq(profile.id, input.profileId))
      })
    }),

  /** Reset game to default profile only. Returns default profile id. */
  reset: publicProcedure
    .input(z.object({ gameId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const db = getDb()
      const defaultId = `${input.gameId}-default`

      return await db.transaction(async (tx) => {
        // Delete all non-default profiles (cascade cleans profileMod)
        await tx
          .delete(profile)
          .where(and(eq(profile.gameId, input.gameId), eq(profile.isDefault, false)))

        // Ensure default profile exists
        const existing = await tx
          .select()
          .from(profile)
          .where(eq(profile.id, defaultId))
          .limit(1)

        if (!existing[0]) {
          await tx.insert(profile).values({
            id: defaultId,
            gameId: input.gameId,
            name: "Default",
            isDefault: true,
            isActive: true,
          })
        } else {
          await tx.update(profile).set({ isActive: true }).where(eq(profile.id, defaultId))
        }

        return defaultId
      })
    }),

  /** Remove all profiles for a game (used in unmanage flow) */
  removeAll: publicProcedure
    .input(z.object({ gameId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const db = getDb()
      await db.delete(profile).where(eq(profile.gameId, input.gameId))
    }),
})
