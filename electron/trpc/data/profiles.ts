import { z } from "zod"
import { t, publicProcedure } from "../trpc"
import { getDb } from "../../db"
import { profile } from "../../db/schema"
import { eq, and, asc } from "drizzle-orm"
import { randomUUID } from "crypto"
import { isoToEpoch } from "./games"

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

      return db.transaction((tx) => {
        // Check if default profile exists
        const existing = tx
          .select()
          .from(profile)
          .where(eq(profile.id, defaultId))
          .limit(1)
          .all()

        if (!existing[0]) {
          tx.insert(profile).values({
            id: defaultId,
            gameId: input.gameId,
            name: "Default",
            isDefault: true,
            isActive: false,
          }).run()
        }

        // If no active profile for this game, set default as active
        const active = tx
          .select()
          .from(profile)
          .where(and(eq(profile.gameId, input.gameId), eq(profile.isActive, true)))
          .limit(1)
          .all()

        if (!active[0]) {
          tx.update(profile).set({ isActive: true }).where(eq(profile.id, defaultId)).run()
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

      return db.transaction((tx) => {
        // Deactivate current active profile
        tx
          .update(profile)
          .set({ isActive: false })
          .where(and(eq(profile.gameId, input.gameId), eq(profile.isActive, true)))
          .run()

        // Insert new profile as active
        const now = new Date().toISOString()
        tx.insert(profile).values({
          id: newId,
          gameId: input.gameId,
          name: input.name,
          isDefault: false,
          isActive: true,
          createdAt: now,
        }).run()

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

      return db.transaction((tx) => {
        // Check if it's the default profile
        const target = tx
          .select()
          .from(profile)
          .where(and(eq(profile.id, input.profileId), eq(profile.gameId, input.gameId)))
          .limit(1)
          .all()

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
          const defaultProfile = tx
            .select()
            .from(profile)
            .where(eq(profile.id, defaultId))
            .limit(1)
            .all()

          if (defaultProfile[0]) {
            tx.update(profile).set({ isActive: true }).where(eq(profile.id, defaultId)).run()
          } else {
            // Fall back to any other profile
            const other = tx
              .select()
              .from(profile)
              .where(and(
                eq(profile.gameId, input.gameId),
                eq(profile.isActive, false),
              ))
              .limit(1)
              .all()
            if (other[0]) {
              tx.update(profile).set({ isActive: true }).where(eq(profile.id, other[0].id)).run()
            }
          }
        }

        // Delete the profile (cascade deletes profileMod rows)
        tx.delete(profile).where(eq(profile.id, input.profileId)).run()
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
      db.transaction((tx) => {
        // Deactivate all profiles for this game
        tx
          .update(profile)
          .set({ isActive: false })
          .where(and(eq(profile.gameId, input.gameId), eq(profile.isActive, true)))
          .run()
        // Activate target
        tx
          .update(profile)
          .set({ isActive: true })
          .where(eq(profile.id, input.profileId))
          .run()
      })
    }),

  /** Reset game to default profile only. Returns default profile id. */
  reset: publicProcedure
    .input(z.object({ gameId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const db = getDb()
      const defaultId = `${input.gameId}-default`

      return db.transaction((tx) => {
        // Delete all non-default profiles (cascade cleans profileMod)
        tx
          .delete(profile)
          .where(and(eq(profile.gameId, input.gameId), eq(profile.isDefault, false)))
          .run()

        // Ensure default profile exists
        const existing = tx
          .select()
          .from(profile)
          .where(eq(profile.id, defaultId))
          .limit(1)
          .all()

        if (!existing[0]) {
          tx.insert(profile).values({
            id: defaultId,
            gameId: input.gameId,
            name: "Default",
            isDefault: true,
            isActive: true,
          }).run()
        } else {
          tx.update(profile).set({ isActive: true }).where(eq(profile.id, defaultId)).run()
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
