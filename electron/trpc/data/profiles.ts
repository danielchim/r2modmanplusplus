import { z } from "zod"
import { t, publicProcedure } from "../trpc"

type Profile = {
  id: string
  name: string
  createdAt: number
}

export const dataProfilesRouter = t.router({
  /** List all profiles for a game */
  list: publicProcedure
    .input(z.object({ gameId: z.string().min(1) }))
    .query(async ({ input }) => {
      // TODO: select from profile where gameId = input.gameId order by createdAt asc
      //       map createdAt ISO -> epoch ms
      void input
      return [] as Profile[]
    }),

  /** Get the active profile for a game, or null */
  getActive: publicProcedure
    .input(z.object({ gameId: z.string().min(1) }))
    .query(async ({ input }) => {
      // TODO: select from profile where gameId = input.gameId and isActive = true limit 1
      void input
      return null as Profile | null
    }),

  /** Ensure a default profile exists for a game. Returns the default profile id. */
  ensureDefault: publicProcedure
    .input(z.object({ gameId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      // TODO: transaction:
      //   1. check if "{gameId}-default" exists
      //   2. if not, insert (id="{gameId}-default", gameId, name="Default", isDefault=true)
      //   3. if no active profile for game, set this as active
      //   4. return the default profile id
      void input
      return "" as string
    }),

  /** Create a new profile and set it as active */
  create: publicProcedure
    .input(z.object({
      gameId: z.string().min(1),
      name: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      // TODO: transaction:
      //   1. generate id: "{gameId}-{crypto.randomUUID()}"
      //   2. deactivate current active profile (set isActive=false)
      //   3. insert new profile (isActive=true, isDefault=false)
      //   4. return created Profile
      void input
      return { id: "", name: input.name, createdAt: Date.now() } as Profile
    }),

  /** Rename a profile */
  rename: publicProcedure
    .input(z.object({
      gameId: z.string().min(1),
      profileId: z.string().min(1),
      newName: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      // TODO: update profile set name = input.newName
      //       where id = input.profileId and gameId = input.gameId
      void input
    }),

  /** Remove a profile. Returns { deleted, reason? }. */
  remove: publicProcedure
    .input(z.object({
      gameId: z.string().min(1),
      profileId: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      // TODO:
      //   1. check if isDefault=true -> return {deleted:false, reason:"Cannot delete default profile"}
      //   2. if isActive, pick adjacent or default as new active
      //   3. delete profile row (cascade deletes profileMod rows)
      //   4. return { deleted: true }
      void input
      return { deleted: false as boolean, reason: undefined as string | undefined }
    }),

  /** Set a profile as active for its game */
  setActive: publicProcedure
    .input(z.object({
      gameId: z.string().min(1),
      profileId: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      // TODO: transaction:
      //   1. update profile set isActive=false where gameId and isActive=true
      //   2. update profile set isActive=true where id = input.profileId
      void input
    }),

  /** Reset game to default profile only. Returns default profile id. */
  reset: publicProcedure
    .input(z.object({ gameId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      // TODO: transaction:
      //   1. delete all non-default profiles (cascade cleans profileMod)
      //   2. ensure default exists, set as active
      //   3. return default profile id
      void input
      return "" as string
    }),

  /** Remove all profiles for a game (used in unmanage flow) */
  removeAll: publicProcedure
    .input(z.object({ gameId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      // TODO: delete from profile where gameId = input.gameId
      //       FK cascade handles profileMod cleanup
      void input
    }),
})
