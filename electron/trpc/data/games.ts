import { z } from "zod"
import { t, publicProcedure } from "../trpc"
import { getDb } from "../../db"
import { game } from "../../db/schema"
import { eq, desc, isNotNull } from "drizzle-orm"

/** Convert ISO8601 string to epoch ms, or null */
export function isoToEpoch(iso: string | null | undefined): number | null {
  return iso ? new Date(iso).getTime() : null
}

export const dataGamesRouter = t.router({
  /** Get all managed games */
  list: publicProcedure.query(async () => {
    const db = getDb()
    const rows = await db.select().from(game)
    return rows.map((r) => ({
      id: r.id,
      isDefault: r.isDefault,
      lastAccessedAt: isoToEpoch(r.lastAccessedAt),
    }))
  }),

  /** Get the default game, or null */
  getDefault: publicProcedure.query(async () => {
    const db = getDb()
    const rows = await db.select().from(game).where(eq(game.isDefault, true)).limit(1)
    const r = rows[0]
    if (!r) return null
    return {
      id: r.id,
      isDefault: r.isDefault,
      lastAccessedAt: isoToEpoch(r.lastAccessedAt),
    }
  }),

  /** Get recently accessed games, ordered by lastAccessedAt desc */
  getRecent: publicProcedure
    .input(z.object({ limit: z.number().int().positive().optional().default(10) }))
    .query(async ({ input }) => {
      const db = getDb()
      const rows = await db
        .select()
        .from(game)
        .where(isNotNull(game.lastAccessedAt))
        .orderBy(desc(game.lastAccessedAt))
        .limit(input.limit)
      return rows.map((r) => ({
        id: r.id,
        isDefault: r.isDefault,
        lastAccessedAt: isoToEpoch(r.lastAccessedAt),
      }))
    }),

  /** Add a game to the managed list */
  add: publicProcedure
    .input(z.object({ gameId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const db = getDb()
      await db.insert(game).values({ id: input.gameId }).onConflictDoNothing()
    }),

  /** Remove a game. Returns the removed gameId or null if not found. */
  remove: publicProcedure
    .input(z.object({ gameId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const db = getDb()
      const deleted = await db.delete(game).where(eq(game.id, input.gameId)).returning()
      return deleted[0]?.id ?? null
    }),

  /** Set (or clear) the default game. Clears previous default first. */
  setDefault: publicProcedure
    .input(z.object({ gameId: z.string().min(1).nullable() }))
    .mutation(async ({ input }) => {
      const db = getDb()
      db.transaction((tx) => {
        tx.update(game).set({ isDefault: false }).where(eq(game.isDefault, true)).run()
        if (input.gameId != null) {
          tx.update(game).set({ isDefault: true }).where(eq(game.id, input.gameId)).run()
        }
      })
    }),

  /** Update lastAccessedAt to now */
  touch: publicProcedure
    .input(z.object({ gameId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const db = getDb()
      await db
        .update(game)
        .set({ lastAccessedAt: new Date().toISOString() })
        .where(eq(game.id, input.gameId))
    }),
})
