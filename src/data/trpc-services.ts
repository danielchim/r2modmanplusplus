/**
 * tRPC-backed implementations of the data service interfaces.
 *
 * Each method delegates to the vanilla tRPC client which communicates with
 * the Electron main process over IPC → SQLite via Drizzle ORM.
 *
 * The client is lazily initialized on first use so the module can be safely
 * imported even if `window.electronTRPC` is not yet available.
 */

import type {
  IGameService,
  ISettingsService,
  IProfileService,
  IModService,
  ManagedGame,
  EffectiveGameSettings,
} from "./interfaces"
import { createVanillaTRPCClient } from "@/lib/trpc"
import type { AppRouter } from "../../electron/trpc/router"
import type { TRPCClient } from "@trpc/client"

// ---------------------------------------------------------------------------
// Lazy client singleton
// ---------------------------------------------------------------------------

let _client: TRPCClient<AppRouter> | null = null

function getClient(): TRPCClient<AppRouter> {
  if (!_client) {
    _client = createVanillaTRPCClient()
    if (!_client) {
      throw new Error(
        "VITE_DATASOURCE=db but electronTRPC is not available. " +
          "DB mode requires running inside Electron.",
      )
    }
  }
  return _client
}

// ---------------------------------------------------------------------------
// Game service
// ---------------------------------------------------------------------------

export function createTRPCGameService(): IGameService {
  return {
    async list(): Promise<ManagedGame[]> {
      return getClient().data.games.list.query()
    },

    async getDefault(): Promise<ManagedGame | null> {
      return getClient().data.games.getDefault.query()
    },

    async getRecent(limit = 10): Promise<ManagedGame[]> {
      return getClient().data.games.getRecent.query({ limit })
    },

    async add(gameId: string): Promise<void> {
      await getClient().data.games.add.mutate({ gameId })
    },

    async remove(gameId: string): Promise<string | null> {
      return getClient().data.games.remove.mutate({ gameId })
    },

    async setDefault(gameId: string | null): Promise<void> {
      await getClient().data.games.setDefault.mutate({ gameId })
    },

    async touch(gameId: string): Promise<void> {
      await getClient().data.games.touch.mutate({ gameId })
    },
  }
}

// ---------------------------------------------------------------------------
// Settings service
// ---------------------------------------------------------------------------

export function createTRPCSettingsService(): ISettingsService {
  return {
    async getGlobal() {
      return getClient().data.settings.getGlobal.query()
    },

    async getForGame(gameId: string) {
      return getClient().data.settings.getForGame.query({ gameId })
    },

    async getEffective(gameId: string): Promise<EffectiveGameSettings> {
      return getClient().data.settings.getEffective.query({
        gameId,
      }) as Promise<EffectiveGameSettings>
    },

    async updateGlobal(updates) {
      await getClient().data.settings.updateGlobal.mutate({ updates })
    },

    async updateForGame(gameId, updates) {
      await getClient().data.settings.updateForGame.mutate({ gameId, updates })
    },

    async resetForGame(gameId) {
      await getClient().data.settings.resetForGame.mutate({ gameId })
    },

    async deleteForGame(gameId) {
      await getClient().data.settings.deleteForGame.mutate({ gameId })
    },
  }
}

// ---------------------------------------------------------------------------
// Profile service
// ---------------------------------------------------------------------------

export function createTRPCProfileService(): IProfileService {
  return {
    async list(gameId) {
      return getClient().data.profiles.list.query({ gameId })
    },

    async getActive(gameId) {
      return getClient().data.profiles.getActive.query({ gameId })
    },

    async ensureDefault(gameId) {
      return getClient().data.profiles.ensureDefault.mutate({ gameId })
    },

    async create(gameId, name) {
      return getClient().data.profiles.create.mutate({ gameId, name })
    },

    async rename(gameId, profileId, newName) {
      await getClient().data.profiles.rename.mutate({
        gameId,
        profileId,
        newName,
      })
    },

    async remove(gameId, profileId) {
      return getClient().data.profiles.remove.mutate({ gameId, profileId })
    },

    async setActive(gameId, profileId) {
      await getClient().data.profiles.setActive.mutate({ gameId, profileId })
    },

    async reset(gameId) {
      return getClient().data.profiles.reset.mutate({ gameId })
    },

    async removeAll(gameId) {
      await getClient().data.profiles.removeAll.mutate({ gameId })
    },
  }
}

// ---------------------------------------------------------------------------
// Mod service
// ---------------------------------------------------------------------------

export function createTRPCModService(): IModService {
  return {
    async listInstalled(profileId) {
      return getClient().data.mods.listInstalled.query({ profileId })
    },

    async isInstalled(profileId, modId) {
      return getClient().data.mods.isInstalled.query({ profileId, modId })
    },

    async isEnabled(profileId, modId) {
      return getClient().data.mods.isEnabled.query({ profileId, modId })
    },

    async getInstalledVersion(profileId, modId) {
      return getClient().data.mods.getInstalledVersion.query({
        profileId,
        modId,
      })
    },

    async getDependencyWarnings(profileId, modId) {
      return getClient().data.mods.getDependencyWarnings.query({
        profileId,
        modId,
      })
    },

    async install(profileId, modId, version) {
      await getClient().data.mods.install.mutate({ profileId, modId, version })
    },

    async uninstall(profileId, modId) {
      await getClient().data.mods.uninstall.mutate({ profileId, modId })
    },

    async uninstallAll(profileId) {
      return getClient().data.mods.uninstallAll.mutate({ profileId })
    },

    async enable(profileId, modId) {
      await getClient().data.mods.enable.mutate({ profileId, modId })
    },

    async disable(profileId, modId) {
      await getClient().data.mods.disable.mutate({ profileId, modId })
    },

    async toggle(profileId, modId) {
      await getClient().data.mods.toggle.mutate({ profileId, modId })
    },

    async setDependencyWarnings(profileId, modId, warnings) {
      await getClient().data.mods.setDependencyWarnings.mutate({
        profileId,
        modId,
        warnings,
      })
    },

    async clearDependencyWarnings(profileId, modId) {
      await getClient().data.mods.clearDependencyWarnings.mutate({
        profileId,
        modId,
      })
    },

    async deleteProfileState(profileId) {
      await getClient().data.mods.deleteProfileState.mutate({ profileId })
    },
  }
}
