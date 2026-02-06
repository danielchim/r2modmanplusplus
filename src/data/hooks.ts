/**
 * React hooks – the stable API that components import.
 *
 * Reads:    currently backed by Zustand selectors for zero-latency reactivity.
 * Writes:   always go through the async service interface.
 *
 * When we migrate to DB, reads switch to React Query (useQuery) and writes
 * switch to useMutation.  Component call-sites stay the same.
 */

import { useMemo, useCallback } from "react"
import { useGameManagementStore } from "@/store/game-management-store"
import { useSettingsStore } from "@/store/settings-store"
import { useProfileStore } from "@/store/profile-store"
import { useModManagementStore } from "@/store/mod-management-store"
import { gameService, settingsService, profileService, modService } from "./index"
import type {
  ManagedGame,
  InstalledMod,
  GlobalSettings,
  GameSettings,
  EffectiveGameSettings,
  Profile,
} from "./interfaces"

// ---------------------------------------------------------------------------
// Game hooks
// ---------------------------------------------------------------------------

export function useGames(): { data: ManagedGame[] } {
  const managedGameIds = useGameManagementStore((s) => s.managedGameIds)
  const defaultGameId = useGameManagementStore((s) => s.defaultGameId)

  const data = useMemo(
    () =>
      managedGameIds.map(
        (id): ManagedGame => ({
          id,
          isDefault: id === defaultGameId,
          lastAccessedAt: null,
        }),
      ),
    [managedGameIds, defaultGameId],
  )

  return { data }
}

export function useDefaultGame(): { data: ManagedGame | null } {
  const defaultGameId = useGameManagementStore((s) => s.defaultGameId)

  const data = useMemo((): ManagedGame | null => {
    if (!defaultGameId) return null
    return { id: defaultGameId, isDefault: true, lastAccessedAt: null }
  }, [defaultGameId])

  return { data }
}

export function useRecentGames(limit = 10): { data: ManagedGame[] } {
  const recentIds = useGameManagementStore((s) => s.recentManagedGameIds)
  const defaultGameId = useGameManagementStore((s) => s.defaultGameId)

  const data = useMemo(
    () =>
      recentIds
        .slice(-limit)
        .reverse()
        .map(
          (id): ManagedGame => ({
            id,
            isDefault: id === defaultGameId,
            lastAccessedAt: null,
          }),
        ),
    [recentIds, defaultGameId, limit],
  )

  return { data }
}

export function useGameMutations() {
  return useMemo(
    () => ({
      add: (gameId: string) => gameService.add(gameId),
      remove: (gameId: string) => gameService.remove(gameId),
      setDefault: (gameId: string | null) => gameService.setDefault(gameId),
      touch: (gameId: string) => gameService.touch(gameId),
    }),
    [],
  )
}

// ---------------------------------------------------------------------------
// Settings hooks
// ---------------------------------------------------------------------------

export function useGlobalSettings(): { data: GlobalSettings } {
  const global = useSettingsStore((s) => s.global)
  return { data: global }
}

export function useGameSettings(gameId: string | null): { data: GameSettings | null } {
  const perGame = useSettingsStore((s) => s.perGame)

  const data = useMemo((): GameSettings | null => {
    if (!gameId) return null
    return useSettingsStore.getState().getPerGame(gameId)
  }, [gameId, perGame])

  return { data }
}

export function useEffectiveGameSettings(
  gameId: string | null,
): { data: EffectiveGameSettings | null } {
  const global = useSettingsStore((s) => s.global)
  const perGame = useSettingsStore((s) => s.perGame)

  const data = useMemo((): EffectiveGameSettings | null => {
    if (!gameId) return null
    const pg = useSettingsStore.getState().getPerGame(gameId)
    return {
      ...pg,
      modDownloadFolder: pg.modDownloadFolder || global.modDownloadFolder,
      cacheFolder: pg.cacheFolder || global.cacheFolder,
    }
  }, [gameId, global, perGame])

  return { data }
}

export function useSettingsMutations() {
  return useMemo(
    () => ({
      updateGlobal: (updates: Partial<GlobalSettings>) =>
        settingsService.updateGlobal(updates),
      updateForGame: (gameId: string, updates: Partial<GameSettings>) =>
        settingsService.updateForGame(gameId, updates),
      resetForGame: (gameId: string) => settingsService.resetForGame(gameId),
      deleteForGame: (gameId: string) => settingsService.deleteForGame(gameId),
    }),
    [],
  )
}

// ---------------------------------------------------------------------------
// Profile hooks
// ---------------------------------------------------------------------------

export function useProfiles(gameId: string | null): { data: Profile[] } {
  const profilesByGame = useProfileStore((s) => s.profilesByGame)

  const data = useMemo(
    () => (gameId ? profilesByGame[gameId] ?? [] : []),
    [gameId, profilesByGame],
  )

  return { data }
}

export function useActiveProfile(gameId: string | null): { data: Profile | null } {
  const profilesByGame = useProfileStore((s) => s.profilesByGame)
  const activeMap = useProfileStore((s) => s.activeProfileIdByGame)

  const data = useMemo((): Profile | null => {
    if (!gameId) return null
    const activeId = activeMap[gameId]
    if (!activeId) return null
    const profiles = profilesByGame[gameId] ?? []
    return profiles.find((p) => p.id === activeId) ?? null
  }, [gameId, profilesByGame, activeMap])

  return { data }
}

export function useProfileMutations() {
  return useMemo(
    () => ({
      ensureDefault: (gameId: string) => profileService.ensureDefault(gameId),
      create: (gameId: string, name: string) => profileService.create(gameId, name),
      rename: (gameId: string, profileId: string, newName: string) =>
        profileService.rename(gameId, profileId, newName),
      remove: (gameId: string, profileId: string) =>
        profileService.remove(gameId, profileId),
      setActive: (gameId: string, profileId: string) =>
        profileService.setActive(gameId, profileId),
      reset: (gameId: string) => profileService.reset(gameId),
      removeAll: (gameId: string) => profileService.removeAll(gameId),
    }),
    [],
  )
}

// ---------------------------------------------------------------------------
// Mod hooks
// ---------------------------------------------------------------------------

export function useInstalledMods(profileId: string | null): { data: InstalledMod[] } {
  const installedByProfile = useModManagementStore((s) => s.installedModsByProfile)
  const enabledByProfile = useModManagementStore((s) => s.enabledModsByProfile)
  const versionsByProfile = useModManagementStore((s) => s.installedModVersionsByProfile)
  const warningsByProfile = useModManagementStore((s) => s.dependencyWarningsByProfile)

  const data = useMemo((): InstalledMod[] => {
    if (!profileId) return []
    const installed = installedByProfile[profileId]
    if (!installed) return []

    const enabled = enabledByProfile[profileId]
    const versions = versionsByProfile[profileId] ?? {}
    const warnings = warningsByProfile[profileId] ?? {}

    return Array.from(installed).map(
      (modId): InstalledMod => ({
        modId,
        installedVersion: versions[modId] ?? "",
        enabled: enabled ? enabled.has(modId) : false,
        dependencyWarnings: warnings[modId] ?? [],
      }),
    )
  }, [profileId, installedByProfile, enabledByProfile, versionsByProfile, warningsByProfile])

  return { data }
}

export function useIsModInstalled(
  profileId: string | null,
  modId: string,
): boolean {
  const installedByProfile = useModManagementStore((s) => s.installedModsByProfile)

  return useMemo(() => {
    if (!profileId) return false
    const set = installedByProfile[profileId]
    return set ? set.has(modId) : false
  }, [profileId, modId, installedByProfile])
}

export function useIsModEnabled(
  profileId: string | null,
  modId: string,
): boolean {
  const enabledByProfile = useModManagementStore((s) => s.enabledModsByProfile)

  return useMemo(() => {
    if (!profileId) return false
    const set = enabledByProfile[profileId]
    return set ? set.has(modId) : false
  }, [profileId, modId, enabledByProfile])
}

export function useModMutations() {
  return useMemo(
    () => ({
      install: (profileId: string, modId: string, version: string) =>
        modService.install(profileId, modId, version),
      uninstall: (profileId: string, modId: string) =>
        modService.uninstall(profileId, modId),
      uninstallAll: (profileId: string) => modService.uninstallAll(profileId),
      enable: (profileId: string, modId: string) =>
        modService.enable(profileId, modId),
      disable: (profileId: string, modId: string) =>
        modService.disable(profileId, modId),
      toggle: (profileId: string, modId: string) =>
        modService.toggle(profileId, modId),
      setDependencyWarnings: (profileId: string, modId: string, warnings: string[]) =>
        modService.setDependencyWarnings(profileId, modId, warnings),
      clearDependencyWarnings: (profileId: string, modId: string) =>
        modService.clearDependencyWarnings(profileId, modId),
      deleteProfileState: (profileId: string) =>
        modService.deleteProfileState(profileId),
    }),
    [],
  )
}

// ---------------------------------------------------------------------------
// Convenience: combined mutation hook for common "unmanage game" flow
// ---------------------------------------------------------------------------

export function useUnmanageGame() {
  const gameMut = useGameMutations()
  const settingsMut = useSettingsMutations()
  const profileMut = useProfileMutations()
  const modMut = useModMutations()

  return useCallback(
    async (gameId: string) => {
      // 1. Remove all profiles' mod state
      const profiles = useProfileStore.getState().profilesByGame[gameId] ?? []
      await Promise.all(profiles.map((p) => modMut.deleteProfileState(p.id)))

      // 2. Remove profiles
      await profileMut.removeAll(gameId)

      // 3. Remove per-game settings
      await settingsMut.deleteForGame(gameId)

      // 4. Remove game itself (returns next default game id)
      return gameMut.remove(gameId)
    },
    [gameMut, settingsMut, profileMut, modMut],
  )
}
