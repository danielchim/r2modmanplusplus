import { z } from "zod"
import { t, publicProcedure } from "../trpc"

/** Convert ISO8601 string to epoch ms, or null */
export function isoToEpoch(iso: string | null | undefined): number | null {
  return iso ? new Date(iso).getTime() : null
}

export const dataGamesRouter = t.router({
  /** Get all managed games */
  list: publicProcedure.query(async () => {
    // TODO: select all from game table, map lastAccessedAt via isoToEpoch
    return [] as Array<{ id: string; isDefault: boolean; lastAccessedAt: number | null }>
  }),

  /** Get the default game, or null */
  getDefault: publicProcedure.query(async () => {
    // TODO: select from game where isDefault = true limit 1
    return null as { id: string; isDefault: boolean; lastAccessedAt: number | null } | null
  }),

  /** Get recently accessed games, ordered by lastAccessedAt desc */
  getRecent: publicProcedure
    .input(z.object({ limit: z.number().int().positive().optional().default(10) }))
    .query(async ({ input }) => {
      // TODO: select from game where lastAccessedAt IS NOT NULL
      //       order by lastAccessedAt desc, limit input.limit
      void input
      return [] as Array<{ id: string; isDefault: boolean; lastAccessedAt: number | null }>
    }),

  /** Add a game to the managed list */
  add: publicProcedure
    .input(z.object({ gameId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      // TODO: insert into game (id) on conflict do nothing
      void input
    }),

  /** Remove a game. Returns the removed gameId or null if not found. */
  remove: publicProcedure
    .input(z.object({ gameId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      // TODO: delete from game where id = input.gameId
      //       cascade deletes gameSettings, profiles, profileMods
      void input
      return null as string | null
    }),

  /** Set (or clear) the default game. Clears previous default first. */
  setDefault: publicProcedure
    .input(z.object({ gameId: z.string().min(1).nullable() }))
    .mutation(async ({ input }) => {
      // TODO: transaction:
      //   1. update game set isDefault = false where isDefault = true
      //   2. if input.gameId != null: update game set isDefault = true where id = input.gameId
      void input
    }),

  /** Update lastAccessedAt to now */
  touch: publicProcedure
    .input(z.object({ gameId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      // TODO: update game set lastAccessedAt = new Date().toISOString() where id = input.gameId
      void input
    }),
})
