import { z } from "zod"
import { t, publicProcedure } from "../trpc"

type InstalledMod = {
  modId: string
  installedVersion: string
  enabled: boolean
  dependencyWarnings: string[]
}

export const dataModsRouter = t.router({
  /** List all installed mods for a profile */
  listInstalled: publicProcedure
    .input(z.object({ profileId: z.string().min(1) }))
    .query(async ({ input }) => {
      // TODO: select from profileMod where profileId = input.profileId
      //       map dependencyWarnings: JSON.parse(text) || []
      void input
      return [] as InstalledMod[]
    }),

  /** Check if a specific mod is installed */
  isInstalled: publicProcedure
    .input(z.object({
      profileId: z.string().min(1),
      modId: z.string().min(1),
    }))
    .query(async ({ input }) => {
      // TODO: select count(*) from profileMod where profileId and modId
      void input
      return false
    }),

  /** Check if a mod is enabled */
  isEnabled: publicProcedure
    .input(z.object({
      profileId: z.string().min(1),
      modId: z.string().min(1),
    }))
    .query(async ({ input }) => {
      // TODO: select enabled from profileMod where profileId and modId
      //       return false if not found
      void input
      return false
    }),

  /** Get the installed version of a mod */
  getInstalledVersion: publicProcedure
    .input(z.object({
      profileId: z.string().min(1),
      modId: z.string().min(1),
    }))
    .query(async ({ input }) => {
      // TODO: select installedVersion from profileMod where profileId and modId
      //       return undefined if not found
      void input
      return undefined as string | undefined
    }),

  /** Get dependency warnings for a mod */
  getDependencyWarnings: publicProcedure
    .input(z.object({
      profileId: z.string().min(1),
      modId: z.string().min(1),
    }))
    .query(async ({ input }) => {
      // TODO: select dependencyWarnings from profileMod where profileId and modId
      //       JSON.parse or [] if null/not found
      void input
      return [] as string[]
    }),

  /** Record a mod as installed (upsert) */
  install: publicProcedure
    .input(z.object({
      profileId: z.string().min(1),
      modId: z.string().min(1),
      version: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      // TODO: insert into profileMod (profileId, modId, installedVersion, enabled=true)
      //       on conflict (profileId, modId) do update set installedVersion, enabled=true
      void input
    }),

  /** Remove a mod record from a profile */
  uninstall: publicProcedure
    .input(z.object({
      profileId: z.string().min(1),
      modId: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      // TODO: delete from profileMod where profileId and modId
      void input
    }),

  /** Remove all mod records from a profile. Returns count removed. */
  uninstallAll: publicProcedure
    .input(z.object({ profileId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      // TODO: delete from profileMod where profileId = input.profileId
      //       return rows affected
      void input
      return 0
    }),

  /** Enable a mod */
  enable: publicProcedure
    .input(z.object({
      profileId: z.string().min(1),
      modId: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      // TODO: update profileMod set enabled=true where profileId and modId
      void input
    }),

  /** Disable a mod */
  disable: publicProcedure
    .input(z.object({
      profileId: z.string().min(1),
      modId: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      // TODO: update profileMod set enabled=false where profileId and modId
      void input
    }),

  /** Toggle mod enabled state */
  toggle: publicProcedure
    .input(z.object({
      profileId: z.string().min(1),
      modId: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      // TODO: transaction: read current enabled, update to NOT enabled
      void input
    }),

  /** Set dependency warnings for a mod */
  setDependencyWarnings: publicProcedure
    .input(z.object({
      profileId: z.string().min(1),
      modId: z.string().min(1),
      warnings: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      // TODO: update profileMod set dependencyWarnings = JSON.stringify(input.warnings)
      //       where profileId and modId
      void input
    }),

  /** Clear dependency warnings for a mod */
  clearDependencyWarnings: publicProcedure
    .input(z.object({
      profileId: z.string().min(1),
      modId: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      // TODO: update profileMod set dependencyWarnings = null where profileId and modId
      void input
    }),

  /** Delete all mod state for a profile */
  deleteProfileState: publicProcedure
    .input(z.object({ profileId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      // TODO: delete from profileMod where profileId = input.profileId
      void input
    }),
})
