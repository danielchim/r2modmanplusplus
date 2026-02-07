/**
 * Zustand-backed implementations of the data service interfaces.
 *
 * Every method wraps synchronous Zustand store access in a Promise so the
 * call-site contract is always async.  When we migrate to a real DB backend
 * these functions get replaced – nothing else changes.
 */

import { useGameManagementStore } from "@/store/game-management-store"
import { useSettingsStore } from "@/store/settings-store"
import { useProfileStore } from "@/store/profile-store"
import { useModManagementStore } from "@/store/mod-management-store"
import type {
  IGameService,
  ISettingsService,
  IProfileService,
  IModService,
  ManagedGame,
  InstalledMod,
  EffectiveGameSettings,
} from "./interfaces"

// ---------------------------------------------------------------------------
// Game service
// ---------------------------------------------------------------------------

export function createZustandGameService(): IGameService {
  const store = () => useGameManagementStore.getState()

  return {
    async list() {
      const s = store()
      return s.managedGameIds.map(
        (id): ManagedGame => ({
          id,
          isDefault: s.defaultGameId === id,
          lastAccessedAt: null, // current store has no per-game timestamp
        }),
      )
    },

    async getDefault() {
      const s = store()
      if (!s.defaultGameId) return null
      return {
        id: s.defaultGameId,
        isDefault: true,
        lastAccessedAt: null,
      }
    },

    async getRecent(limit = 10) {
      const s = store()
      return s.recentManagedGameIds
        .slice(-limit)
        .reverse()
        .map(
          (id): ManagedGame => ({
            id,
            isDefault: s.defaultGameId === id,
            lastAccessedAt: null,
          }),
        )
    },

    async add(gameId) {
      store().addManagedGame(gameId)
    },

    async remove(gameId) {
      return store().removeManagedGame(gameId)
    },

    async setDefault(gameId) {
      store().setDefaultGameId(gameId)
    },

    async touch(gameId) {
      store().appendRecentManagedGame(gameId)
    },
  }
}

// ---------------------------------------------------------------------------
// Settings service
// ---------------------------------------------------------------------------

export function createZustandSettingsService(): ISettingsService {
  const store = () => useSettingsStore.getState()

  return {
    async getGlobal() {
      return { ...store().global }
    },

    async getForGame(gameId) {
      return store().getPerGame(gameId)
    },

    async getEffective(gameId): Promise<EffectiveGameSettings> {
      const s = store()
      const global = s.global
      const perGame = s.getPerGame(gameId)

      return {
        ...perGame,
        modDownloadFolder: perGame.modDownloadFolder || global.modDownloadFolder,
        cacheFolder: perGame.cacheFolder || global.cacheFolder,
      }
    },

    async updateGlobal(updates) {
      store().updateGlobal(updates)
    },

    async updateForGame(gameId, updates) {
      store().updatePerGame(gameId, updates)
    },

    async resetForGame(gameId) {
      store().resetPerGame(gameId)
    },

    async deleteForGame(gameId) {
      store().deletePerGame(gameId)
    },
  }
}

// ---------------------------------------------------------------------------
// Profile service
// ---------------------------------------------------------------------------

export function createZustandProfileService(): IProfileService {
  const store = () => useProfileStore.getState()

  return {
    async list(gameId) {
      const s = store()
      return s.profilesByGame[gameId] ?? []
    },

    async getActive(gameId) {
      const s = store()
      const activeId = s.activeProfileIdByGame[gameId]
      if (!activeId) return null
      const profiles = s.profilesByGame[gameId] ?? []
      return profiles.find((p) => p.id === activeId) ?? null
    },

    async ensureDefault(gameId) {
      return store().ensureDefaultProfile(gameId)
    },

    async create(gameId, name) {
      return store().createProfile(gameId, name)
    },

    async rename(gameId, profileId, newName) {
      store().renameProfile(gameId, profileId, newName)
    },

    async remove(gameId, profileId) {
      return store().deleteProfile(gameId, profileId)
    },

    async setActive(gameId, profileId) {
      store().setActiveProfile(gameId, profileId)
    },

    async reset(gameId) {
      return store().resetGameProfilesToDefault(gameId)
    },

    async removeAll(gameId) {
      store().removeGameProfiles(gameId)
    },
  }
}

// ---------------------------------------------------------------------------
// Mod service
// ---------------------------------------------------------------------------

export function createZustandModService(): IModService {
  const store = () => useModManagementStore.getState()

  return {
    async listInstalled(profileId) {
      const s = store()
      const modIds = s.getInstalledModIds(profileId)
      return modIds.map(
        (modId): InstalledMod => ({
          modId,
          installedVersion: s.getInstalledVersion(profileId, modId) ?? "",
          enabled: s.isModEnabled(profileId, modId),
          dependencyWarnings: s.getDependencyWarnings(profileId, modId),
        }),
      )
    },

    async isInstalled(profileId, modId) {
      return store().isModInstalled(profileId, modId)
    },

    async isEnabled(profileId, modId) {
      return store().isModEnabled(profileId, modId)
    },

    async getInstalledVersion(profileId, modId) {
      return store().getInstalledVersion(profileId, modId)
    },

    async getDependencyWarnings(profileId, modId) {
      return store().getDependencyWarnings(profileId, modId)
    },

    async install(profileId, modId, version) {
      store().installMod(profileId, modId, version)
    },

    async uninstall(profileId, modId) {
      await store().uninstallMod(profileId, modId)
    },

    async uninstallAll(profileId) {
      return store().uninstallAllMods(profileId)
    },

    async enable(profileId, modId) {
      store().enableMod(profileId, modId)
    },

    async disable(profileId, modId) {
      store().disableMod(profileId, modId)
    },

    async toggle(profileId, modId) {
      store().toggleMod(profileId, modId)
    },

    async setDependencyWarnings(profileId, modId, warnings) {
      store().setDependencyWarnings(profileId, modId, warnings)
    },

    async clearDependencyWarnings(profileId, modId) {
      store().clearDependencyWarnings(profileId, modId)
    },

    async deleteProfileState(profileId) {
      store().deleteProfileState(profileId)
    },
  }
}
