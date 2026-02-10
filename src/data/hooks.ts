/**
 * React hooks – the stable API that components import.
 *
 * Data hooks:   useSuspenseQuery → return type is always T (never undefined).
 *               Hook return shapes are identical regardless of VITE_DATASOURCE.
 * Action hooks: call async service functions directly.
 *               In Zustand mode, DataBridge handles cache invalidation.
 *               In DB mode, action hooks explicitly invalidate after mutations.
 *
 * Pattern for component migration:
 *   Before: const x = useProfileStore((s) => s.profilesByGame)
 *   After:  const { profilesByGame } = useProfileData()
 */

import { useEffect, useMemo, useCallback } from "react"
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { useGameManagementStore } from "@/store/game-management-store"
import { useSettingsStore } from "@/store/settings-store"
import { useProfileStore } from "@/store/profile-store"
import type { Profile } from "@/store/profile-store"
import { useModManagementStore } from "@/store/mod-management-store"
import {
  gameService,
  settingsService,
  profileService,
  modService,
} from "./services"
import type { GlobalSettings, GameSettings } from "./interfaces"
import { isDbMode, isZustandMode } from "./datasource"

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const dataKeys = {
  gameManagement: ["store", "gameManagement"] as const,
  settings: ["store", "settings"] as const,
  profiles: ["store", "profiles"] as const,
  modManagement: ["store", "modManagement"] as const,
}

// ---------------------------------------------------------------------------
// DataBridge – subscribe to Zustand stores and invalidate React Query cache
// ---------------------------------------------------------------------------

export function DataBridge() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // In DB mode, data store subscriptions are not needed — mutations
    // explicitly invalidate queries. No-op.
    if (isDbMode) return

    const unsubs = [
      useGameManagementStore.subscribe(() => {
        queryClient.invalidateQueries({ queryKey: dataKeys.gameManagement })
      }),
      useSettingsStore.subscribe(() => {
        queryClient.invalidateQueries({ queryKey: dataKeys.settings })
      }),
      useProfileStore.subscribe(() => {
        queryClient.invalidateQueries({ queryKey: dataKeys.profiles })
      }),
      useModManagementStore.subscribe(() => {
        queryClient.invalidateQueries({ queryKey: dataKeys.modManagement })
      }),
    ]
    return () => unsubs.forEach((fn) => fn())
  }, [queryClient])

  return null
}

// ===========================================================================
// Game Management
// ===========================================================================

type GameManagementData = {
  managedGameIds: string[]
  recentManagedGameIds: string[]
  defaultGameId: string | null
}

export function useGameManagementData(): GameManagementData {
  const { data } = useSuspenseQuery({
    queryKey: dataKeys.gameManagement,
    queryFn: async (): Promise<GameManagementData> => {
      if (isDbMode) {
        const [games, recentGames, defaultGame] = await Promise.all([
          gameService.list(),
          gameService.getRecent(),
          gameService.getDefault(),
        ])
        return {
          managedGameIds: games.map((g) => g.id),
          recentManagedGameIds: recentGames.map((g) => g.id),
          defaultGameId: defaultGame?.id ?? null,
        }
      }
      const s = useGameManagementStore.getState()
      return {
        managedGameIds: s.managedGameIds,
        recentManagedGameIds: s.recentManagedGameIds,
        defaultGameId: s.defaultGameId,
      }
    },
    ...(isZustandMode && {
      initialData: (): GameManagementData => {
        const s = useGameManagementStore.getState()
        return {
          managedGameIds: s.managedGameIds,
          recentManagedGameIds: s.recentManagedGameIds,
          defaultGameId: s.defaultGameId,
        }
      },
    }),
    staleTime: Infinity,
  })
  return data
}

export function useGameManagementActions() {
  const queryClient = useQueryClient()

  return useMemo(
    () => {
      const invalidate = (...keys: (readonly string[])[]) =>
        isDbMode
          ? Promise.all(keys.map((k) => queryClient.invalidateQueries({ queryKey: k })))
          : Promise.resolve()

      return {
        addManagedGame: async (gameId: string) => {
          await gameService.add(gameId)
          await invalidate(dataKeys.gameManagement, dataKeys.profiles, dataKeys.settings)
        },
        removeManagedGame: async (gameId: string) => {
          const result = await gameService.remove(gameId)
          await invalidate(
            dataKeys.gameManagement,
            dataKeys.profiles,
            dataKeys.modManagement,
            dataKeys.settings,
          )
          return result
        },
        setDefaultGameId: async (gameId: string | null) => {
          await gameService.setDefault(gameId)
          await invalidate(dataKeys.gameManagement)
        },
        appendRecentManagedGame: async (gameId: string) => {
          await gameService.touch(gameId)
          await invalidate(dataKeys.gameManagement)
        },
      }
    },
    [queryClient],
  )
}

// ===========================================================================
// Settings
// ===========================================================================

type SettingsData = {
  global: GlobalSettings
  perGame: Record<string, GameSettings>
  /** Derived helper matching store's getPerGame(). */
  getPerGame: (gameId: string) => GameSettings
}

const defaultGameSettings: GameSettings = {
  gameInstallFolder: "",
  modDownloadFolder: "",
  cacheFolder: "",
  modCacheFolder: "",
  launchParameters: "",
  onlineModListCacheDate: null,
}

export function useSettingsData(): SettingsData {
  const { data } = useSuspenseQuery({
    queryKey: dataKeys.settings,
    queryFn: async () => {
      if (isDbMode) {
        const [global, games] = await Promise.all([
          settingsService.getGlobal(),
          gameService.list(),
        ])
        const perGameEntries = await Promise.all(
          games.map(
            async (g) =>
              [g.id, await settingsService.getForGame(g.id)] as const,
          ),
        )
        return {
          global,
          perGame: Object.fromEntries(perGameEntries) as Record<
            string,
            GameSettings
          >,
        }
      }
      const s = useSettingsStore.getState()
      return {
        global: { ...s.global },
        perGame: { ...s.perGame } as Record<string, GameSettings>,
      }
    },
    ...(isZustandMode && {
      initialData: () => {
        const s = useSettingsStore.getState()
        return {
          global: { ...s.global },
          perGame: { ...s.perGame } as Record<string, GameSettings>,
        }
      },
    }),
    staleTime: Infinity,
  })

  const getPerGame = useCallback(
    (gameId: string): GameSettings => ({
      ...defaultGameSettings,
      ...data.perGame[gameId],
    }),
    [data.perGame],
  )

  return { global: data.global, perGame: data.perGame, getPerGame }
}

export function useSettingsActions() {
  const queryClient = useQueryClient()

  return useMemo(
    () => {
      const invalidate = (...keys: (readonly string[])[]) =>
        isDbMode
          ? Promise.all(keys.map((k) => queryClient.invalidateQueries({ queryKey: k })))
          : Promise.resolve()

      return {
        updateGlobal: async (updates: Partial<GlobalSettings>) => {
          await settingsService.updateGlobal(updates)
          await invalidate(dataKeys.settings)
        },
        updatePerGame: async (
          gameId: string,
          updates: Partial<GameSettings>,
        ) => {
          await settingsService.updateForGame(gameId, updates)
          await invalidate(dataKeys.settings)
        },
        resetPerGame: async (gameId: string) => {
          await settingsService.resetForGame(gameId)
          await invalidate(dataKeys.settings)
        },
        deletePerGame: async (gameId: string) => {
          await settingsService.deleteForGame(gameId)
          await invalidate(dataKeys.settings)
        },
      }
    },
    [queryClient],
  )
}

// ===========================================================================
// Profiles
// ===========================================================================

type ProfileData = {
  profilesByGame: Record<string, Profile[]>
  activeProfileIdByGame: Record<string, string>
}

export function useProfileData(): ProfileData {
  const { data } = useSuspenseQuery({
    queryKey: dataKeys.profiles,
    queryFn: async (): Promise<ProfileData> => {
      if (isDbMode) {
        const games = await gameService.list()
        const entries = await Promise.all(
          games.map(async (g) => {
            const [profiles, active] = await Promise.all([
              profileService.list(g.id),
              profileService.getActive(g.id),
            ])
            return { gameId: g.id, profiles, activeId: active?.id ?? "" }
          }),
        )
        return {
          profilesByGame: Object.fromEntries(
            entries.map((e) => [e.gameId, e.profiles]),
          ),
          activeProfileIdByGame: Object.fromEntries(
            entries
              .filter((e) => e.activeId)
              .map((e) => [e.gameId, e.activeId]),
          ),
        }
      }
      const s = useProfileStore.getState()
      return {
        profilesByGame: s.profilesByGame,
        activeProfileIdByGame: s.activeProfileIdByGame,
      }
    },
    ...(isZustandMode && {
      initialData: (): ProfileData => {
        const s = useProfileStore.getState()
        return {
          profilesByGame: s.profilesByGame,
          activeProfileIdByGame: s.activeProfileIdByGame,
        }
      },
    }),
    staleTime: Infinity,
  })
  return data
}

export function useProfileActions() {
  const queryClient = useQueryClient()

  return useMemo(
    () => {
      const invalidate = (...keys: (readonly string[])[]) =>
        isDbMode
          ? Promise.all(keys.map((k) => queryClient.invalidateQueries({ queryKey: k })))
          : Promise.resolve()

      return {
        ensureDefaultProfile: async (gameId: string) => {
          const result = await profileService.ensureDefault(gameId)
          await invalidate(dataKeys.profiles, dataKeys.modManagement)
          return result
        },
        setActiveProfile: async (gameId: string, profileId: string) => {
          await profileService.setActive(gameId, profileId)
          await invalidate(dataKeys.profiles)
        },
        createProfile: async (gameId: string, name: string) => {
          const result = await profileService.create(gameId, name)
          await invalidate(dataKeys.profiles, dataKeys.modManagement)
          return result
        },
        renameProfile: async (
          gameId: string,
          profileId: string,
          newName: string,
        ) => {
          await profileService.rename(gameId, profileId, newName)
          await invalidate(dataKeys.profiles)
        },
        deleteProfile: async (gameId: string, profileId: string) => {
          const result = await profileService.remove(gameId, profileId)
          await invalidate(dataKeys.profiles, dataKeys.modManagement)
          return result
        },
        resetGameProfilesToDefault: async (gameId: string) => {
          const result = await profileService.reset(gameId)
          await invalidate(dataKeys.profiles, dataKeys.modManagement)
          return result
        },
        removeGameProfiles: async (gameId: string) => {
          await profileService.removeAll(gameId)
          await invalidate(dataKeys.profiles, dataKeys.modManagement)
        },
      }
    },
    [queryClient],
  )
}

// ===========================================================================
// Mod Management
// ===========================================================================

type ModManagementQueryData = {
  installedModsByProfile: Record<string, Set<string>>
  enabledModsByProfile: Record<string, Set<string>>
  installedModVersionsByProfile: Record<string, Record<string, string>>
  dependencyWarningsByProfile: Record<string, Record<string, string[]>>
}

type ModManagementData = ModManagementQueryData & {
  uninstallingMods: Set<string>
  // Derived helpers (matching store method signatures)
  isModInstalled: (profileId: string, modId: string) => boolean
  isModEnabled: (profileId: string, modId: string) => boolean
  getInstalledModIds: (profileId: string) => string[]
  getInstalledVersion: (
    profileId: string,
    modId: string,
  ) => string | undefined
  getDependencyWarnings: (profileId: string, modId: string) => string[]
}

export function useModManagementData(): ModManagementData {
  // uninstallingMods is UI state — always from Zustand regardless of VITE_DATASOURCE.
  // Subscribe directly so it doesn't trigger a full DB re-fetch.
  const uninstallingMods = useModManagementStore((s) => s.uninstallingMods)

  const { data } = useSuspenseQuery({
    queryKey: dataKeys.modManagement,
    queryFn: async (): Promise<ModManagementQueryData> => {
      if (isDbMode) {
        const games = await gameService.list()
        const allProfiles = (
          await Promise.all(games.map((g) => profileService.list(g.id)))
        ).flat()

        const profileMods = await Promise.all(
          allProfiles.map(async (p) => ({
            profileId: p.id,
            mods: await modService.listInstalled(p.id),
          })),
        )

        const installedModsByProfile: Record<string, Set<string>> = {}
        const enabledModsByProfile: Record<string, Set<string>> = {}
        const installedModVersionsByProfile: Record<
          string,
          Record<string, string>
        > = {}
        const dependencyWarningsByProfile: Record<
          string,
          Record<string, string[]>
        > = {}

        for (const { profileId, mods } of profileMods) {
          const installed = new Set<string>()
          const enabled = new Set<string>()
          const versions: Record<string, string> = {}
          const warnings: Record<string, string[]> = {}

          for (const mod of mods) {
            installed.add(mod.modId)
            if (mod.enabled) enabled.add(mod.modId)
            versions[mod.modId] = mod.installedVersion
            if (mod.dependencyWarnings.length > 0) {
              warnings[mod.modId] = mod.dependencyWarnings
            }
          }

          installedModsByProfile[profileId] = installed
          enabledModsByProfile[profileId] = enabled
          installedModVersionsByProfile[profileId] = versions
          dependencyWarningsByProfile[profileId] = warnings
        }

        return {
          installedModsByProfile,
          enabledModsByProfile,
          installedModVersionsByProfile,
          dependencyWarningsByProfile,
        }
      }
      const s = useModManagementStore.getState()
      return {
        installedModsByProfile: s.installedModsByProfile,
        enabledModsByProfile: s.enabledModsByProfile,
        installedModVersionsByProfile: s.installedModVersionsByProfile,
        dependencyWarningsByProfile: s.dependencyWarningsByProfile,
      }
    },
    ...(isZustandMode && {
      initialData: (): ModManagementQueryData => {
        const s = useModManagementStore.getState()
        return {
          installedModsByProfile: s.installedModsByProfile,
          enabledModsByProfile: s.enabledModsByProfile,
          installedModVersionsByProfile: s.installedModVersionsByProfile,
          dependencyWarningsByProfile: s.dependencyWarningsByProfile,
        }
      },
    }),
    staleTime: Infinity,
    structuralSharing: false, // Sets don't survive structural sharing
  })

  // Derived helpers matching store methods
  const isModInstalled = useCallback(
    (profileId: string, modId: string) => {
      const set = data.installedModsByProfile[profileId]
      return set ? set.has(modId) : false
    },
    [data.installedModsByProfile],
  )

  const isModEnabled = useCallback(
    (profileId: string, modId: string) => {
      const set = data.enabledModsByProfile[profileId]
      return set ? set.has(modId) : false
    },
    [data.enabledModsByProfile],
  )

  const getInstalledModIds = useCallback(
    (profileId: string) => {
      const set = data.installedModsByProfile[profileId]
      return set ? Array.from(set) : []
    },
    [data.installedModsByProfile],
  )

  const getInstalledVersion = useCallback(
    (profileId: string, modId: string) => {
      const map = data.installedModVersionsByProfile[profileId]
      return map ? map[modId] : undefined
    },
    [data.installedModVersionsByProfile],
  )

  const getDependencyWarnings = useCallback(
    (profileId: string, modId: string) => {
      const map = data.dependencyWarningsByProfile[profileId]
      return map ? map[modId] || [] : []
    },
    [data.dependencyWarningsByProfile],
  )

  return {
    ...data,
    uninstallingMods,
    isModInstalled,
    isModEnabled,
    getInstalledModIds,
    getInstalledVersion,
    getDependencyWarnings,
  }
}

export function useModManagementActions() {
  const queryClient = useQueryClient()

  return useMemo(
    () => {
      const invalidate = (...keys: (readonly string[])[]) =>
        isDbMode
          ? Promise.all(keys.map((k) => queryClient.invalidateQueries({ queryKey: k })))
          : Promise.resolve()

      return {
        installMod: async (
          profileId: string,
          modId: string,
          version: string,
        ) => {
          await modService.install(profileId, modId, version)
          await invalidate(dataKeys.modManagement)
        },
        uninstallMod: async (profileId: string, modId: string) => {
          await modService.uninstall(profileId, modId)
          await invalidate(dataKeys.modManagement)
        },
        uninstallAllMods: async (profileId: string) => {
          const result = await modService.uninstallAll(profileId)
          await invalidate(dataKeys.modManagement)
          return result
        },
        enableMod: async (profileId: string, modId: string) => {
          await modService.enable(profileId, modId)
          await invalidate(dataKeys.modManagement)
        },
        disableMod: async (profileId: string, modId: string) => {
          await modService.disable(profileId, modId)
          await invalidate(dataKeys.modManagement)
        },
        toggleMod: async (profileId: string, modId: string) => {
          await modService.toggle(profileId, modId)
          await invalidate(dataKeys.modManagement)
        },
        setDependencyWarnings: async (
          profileId: string,
          modId: string,
          warnings: string[],
        ) => {
          await modService.setDependencyWarnings(profileId, modId, warnings)
          await invalidate(dataKeys.modManagement)
        },
        clearDependencyWarnings: async (profileId: string, modId: string) => {
          await modService.clearDependencyWarnings(profileId, modId)
          await invalidate(dataKeys.modManagement)
        },
        deleteProfileState: async (profileId: string) => {
          await modService.deleteProfileState(profileId)
          await invalidate(dataKeys.modManagement)
        },
      }
    },
    [queryClient],
  )
}

// ===========================================================================
// Convenience: combined mutation for "unmanage game" flow
// ===========================================================================

export function useUnmanageGame() {
  const gameMut = useGameManagementActions()
  const settingsMut = useSettingsActions()
  const profileMut = useProfileActions()
  const modMut = useModManagementActions()

  return useCallback(
    async (gameId: string) => {
      // Use service to get profiles (works in both Zustand and DB mode)
      const profiles = await profileService.list(gameId)
      await Promise.all(profiles.map((p) => modMut.deleteProfileState(p.id)))
      await profileMut.removeGameProfiles(gameId)
      await settingsMut.deletePerGame(gameId)
      return gameMut.removeManagedGame(gameId)
    },
    [gameMut, settingsMut, profileMut, modMut],
  )
}
