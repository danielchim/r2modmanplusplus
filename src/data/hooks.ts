/**
 * React hooks – the stable API that components import.
 *
 * Data hooks:   useSuspenseQuery → return type is always T (never undefined).
 *               This matches the Zustand selector return shapes exactly,
 *               so components only need to swap the hook call.
 * Action hooks: call async service functions directly.
 *               DataBridge handles cache invalidation when Zustand changes.
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
      const s = useGameManagementStore.getState()
      return {
        managedGameIds: s.managedGameIds,
        recentManagedGameIds: s.recentManagedGameIds,
        defaultGameId: s.defaultGameId,
      }
    },
    initialData: (): GameManagementData => {
      const s = useGameManagementStore.getState()
      return {
        managedGameIds: s.managedGameIds,
        recentManagedGameIds: s.recentManagedGameIds,
        defaultGameId: s.defaultGameId,
      }
    },
    staleTime: Infinity,
  })
  return data
}

export function useGameManagementActions() {
  return useMemo(
    () => ({
      addManagedGame: (gameId: string) => gameService.add(gameId),
      removeManagedGame: (gameId: string) => gameService.remove(gameId),
      setDefaultGameId: (gameId: string | null) =>
        gameService.setDefault(gameId),
      appendRecentManagedGame: (gameId: string) => gameService.touch(gameId),
    }),
    []
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
      const s = useSettingsStore.getState()
      return {
        global: { ...s.global },
        perGame: { ...s.perGame } as Record<string, GameSettings>,
      }
    },
    initialData: () => {
      const s = useSettingsStore.getState()
      return {
        global: { ...s.global },
        perGame: { ...s.perGame } as Record<string, GameSettings>,
      }
    },
    staleTime: Infinity,
  })

  const getPerGame = useCallback(
    (gameId: string): GameSettings => ({
      ...defaultGameSettings,
      ...data.perGame[gameId],
    }),
    [data.perGame]
  )

  return { global: data.global, perGame: data.perGame, getPerGame }
}

export function useSettingsActions() {
  return useMemo(
    () => ({
      updateGlobal: (updates: Partial<GlobalSettings>) =>
        settingsService.updateGlobal(updates),
      updatePerGame: (gameId: string, updates: Partial<GameSettings>) =>
        settingsService.updateForGame(gameId, updates),
      resetPerGame: (gameId: string) => settingsService.resetForGame(gameId),
      deletePerGame: (gameId: string) =>
        settingsService.deleteForGame(gameId),
    }),
    []
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
      const s = useProfileStore.getState()
      return {
        profilesByGame: s.profilesByGame,
        activeProfileIdByGame: s.activeProfileIdByGame,
      }
    },
    initialData: (): ProfileData => {
      const s = useProfileStore.getState()
      return {
        profilesByGame: s.profilesByGame,
        activeProfileIdByGame: s.activeProfileIdByGame,
      }
    },
    staleTime: Infinity,
  })
  return data
}

export function useProfileActions() {
  return useMemo(
    () => ({
      ensureDefaultProfile: (gameId: string) =>
        profileService.ensureDefault(gameId),
      setActiveProfile: (gameId: string, profileId: string) =>
        profileService.setActive(gameId, profileId),
      createProfile: (gameId: string, name: string) =>
        profileService.create(gameId, name),
      renameProfile: (
        gameId: string,
        profileId: string,
        newName: string
      ) => profileService.rename(gameId, profileId, newName),
      deleteProfile: (gameId: string, profileId: string) =>
        profileService.remove(gameId, profileId),
      resetGameProfilesToDefault: (gameId: string) =>
        profileService.reset(gameId),
      removeGameProfiles: (gameId: string) =>
        profileService.removeAll(gameId),
    }),
    []
  )
}

// ===========================================================================
// Mod Management
// ===========================================================================

type ModManagementData = {
  installedModsByProfile: Record<string, Set<string>>
  enabledModsByProfile: Record<string, Set<string>>
  installedModVersionsByProfile: Record<string, Record<string, string>>
  dependencyWarningsByProfile: Record<string, Record<string, string[]>>
  uninstallingMods: Set<string>
  // Derived helpers (matching store method signatures)
  isModInstalled: (profileId: string, modId: string) => boolean
  isModEnabled: (profileId: string, modId: string) => boolean
  getInstalledModIds: (profileId: string) => string[]
  getInstalledVersion: (
    profileId: string,
    modId: string
  ) => string | undefined
  getDependencyWarnings: (profileId: string, modId: string) => string[]
}

export function useModManagementData(): ModManagementData {
  const { data } = useSuspenseQuery({
    queryKey: dataKeys.modManagement,
    queryFn: async () => {
      const s = useModManagementStore.getState()
      return {
        installedModsByProfile: s.installedModsByProfile,
        enabledModsByProfile: s.enabledModsByProfile,
        installedModVersionsByProfile: s.installedModVersionsByProfile,
        dependencyWarningsByProfile: s.dependencyWarningsByProfile,
        uninstallingMods: s.uninstallingMods,
      }
    },
    initialData: () => {
      const s = useModManagementStore.getState()
      return {
        installedModsByProfile: s.installedModsByProfile,
        enabledModsByProfile: s.enabledModsByProfile,
        installedModVersionsByProfile: s.installedModVersionsByProfile,
        dependencyWarningsByProfile: s.dependencyWarningsByProfile,
        uninstallingMods: s.uninstallingMods,
      }
    },
    staleTime: Infinity,
    structuralSharing: false, // Sets don't survive structural sharing
  })

  // Derived helpers matching store methods
  const isModInstalled = useCallback(
    (profileId: string, modId: string) => {
      const set = data.installedModsByProfile[profileId]
      return set ? set.has(modId) : false
    },
    [data.installedModsByProfile]
  )

  const isModEnabled = useCallback(
    (profileId: string, modId: string) => {
      const set = data.enabledModsByProfile[profileId]
      return set ? set.has(modId) : false
    },
    [data.enabledModsByProfile]
  )

  const getInstalledModIds = useCallback(
    (profileId: string) => {
      const set = data.installedModsByProfile[profileId]
      return set ? Array.from(set) : []
    },
    [data.installedModsByProfile]
  )

  const getInstalledVersion = useCallback(
    (profileId: string, modId: string) => {
      const map = data.installedModVersionsByProfile[profileId]
      return map ? map[modId] : undefined
    },
    [data.installedModVersionsByProfile]
  )

  const getDependencyWarnings = useCallback(
    (profileId: string, modId: string) => {
      const map = data.dependencyWarningsByProfile[profileId]
      return map ? map[modId] || [] : []
    },
    [data.dependencyWarningsByProfile]
  )

  return {
    ...data,
    isModInstalled,
    isModEnabled,
    getInstalledModIds,
    getInstalledVersion,
    getDependencyWarnings,
  }
}

export function useModManagementActions() {
  return useMemo(
    () => ({
      installMod: (profileId: string, modId: string, version: string) =>
        modService.install(profileId, modId, version),
      uninstallMod: (profileId: string, modId: string) =>
        modService.uninstall(profileId, modId),
      uninstallAllMods: (profileId: string) =>
        modService.uninstallAll(profileId),
      enableMod: (profileId: string, modId: string) =>
        modService.enable(profileId, modId),
      disableMod: (profileId: string, modId: string) =>
        modService.disable(profileId, modId),
      toggleMod: (profileId: string, modId: string) =>
        modService.toggle(profileId, modId),
      setDependencyWarnings: (
        profileId: string,
        modId: string,
        warnings: string[]
      ) => modService.setDependencyWarnings(profileId, modId, warnings),
      clearDependencyWarnings: (profileId: string, modId: string) =>
        modService.clearDependencyWarnings(profileId, modId),
      deleteProfileState: (profileId: string) =>
        modService.deleteProfileState(profileId),
    }),
    []
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
      const profiles =
        useProfileStore.getState().profilesByGame[gameId] ?? []
      await Promise.all(profiles.map((p) => modMut.deleteProfileState(p.id)))
      await profileMut.removeGameProfiles(gameId)
      await settingsMut.deletePerGame(gameId)
      return gameMut.removeManagedGame(gameId)
    },
    [gameMut, settingsMut, profileMut, modMut]
  )
}
