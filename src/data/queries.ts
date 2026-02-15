/**
 * Query hooks – pure data fetching via useSuspenseQuery.
 *
 * Each hook returns data directly (no loading/error states – Suspense handles that).
 * Parameterized hooks accept `null` and return safe defaults so components
 * don't need conditional hook calls.
 */

import { useMemo, useCallback } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { getClient } from "./trpc-client"
import { queryKeys } from "./query-keys"
import type { GlobalSettings, GameSettings, Profile, InstalledMod } from "./types"

// ---------------------------------------------------------------------------
// Games
// ---------------------------------------------------------------------------

export function useGames() {
  const { data: games } = useSuspenseQuery({
    queryKey: queryKeys.games.list,
    queryFn: () => getClient().data.games.list.query(),
    staleTime: Infinity,
  })

  return useMemo(
    () => ({
      managedGameIds: games.map((g) => g.id),
      recentManagedGameIds: games
        .filter((g) => g.lastAccessedAt != null)
        .sort((a, b) => (b.lastAccessedAt ?? 0) - (a.lastAccessedAt ?? 0))
        .slice(0, 10)
        .map((g) => g.id),
      defaultGameId: games.find((g) => g.isDefault)?.id ?? null,
    }),
    [games],
  )
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

const defaultGameSettings: GameSettings = {
  gameInstallFolder: "",
  modDownloadFolder: "",
  cacheFolder: "",
  modCacheFolder: "",
  launchParameters: "",
  onlineModListCacheDate: null,
}

export function useGlobalSettings(): GlobalSettings {
  const { data } = useSuspenseQuery({
    queryKey: queryKeys.settings.global,
    queryFn: () => getClient().data.settings.getGlobal.query(),
    staleTime: Infinity,
  })
  return data
}

export function useGameSettings(gameId: string | null): GameSettings {
  const { data } = useSuspenseQuery({
    queryKey: gameId ? queryKeys.settings.game(gameId) : queryKeys.settings.gameDisabled,
    queryFn: () =>
      gameId
        ? getClient().data.settings.getForGame.query({ gameId })
        : defaultGameSettings,
    staleTime: Infinity,
  })
  return useMemo(() => ({ ...defaultGameSettings, ...data }), [data])
}

/**
 * Combined settings hook – returns global + all per-game settings.
 * Used by DownloadBridge which needs to sync everything to main process.
 */
export function useAllSettings() {
  const { data } = useSuspenseQuery({
    queryKey: queryKeys.settings.all,
    queryFn: async () => {
      const client = getClient()
      const [global, games] = await Promise.all([
        client.data.settings.getGlobal.query(),
        client.data.games.list.query(),
      ])
      const entries = await Promise.all(
        games.map(
          async (g) =>
            [g.id, await client.data.settings.getForGame.query({ gameId: g.id })] as const,
        ),
      )
      return {
        global: global as GlobalSettings,
        perGame: Object.fromEntries(entries) as Record<string, GameSettings>,
      }
    },
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

// ---------------------------------------------------------------------------
// Profiles
// ---------------------------------------------------------------------------

export function useProfiles(gameId: string | null): Profile[] {
  const { data } = useSuspenseQuery({
    queryKey: gameId ? queryKeys.profiles.list(gameId) : queryKeys.profiles.listDisabled,
    queryFn: () =>
      gameId ? getClient().data.profiles.list.query({ gameId }) : [],
    staleTime: Infinity,
  })
  return data
}

export function useActiveProfileId(gameId: string | null): string | null {
  const { data } = useSuspenseQuery({
    queryKey: gameId ? queryKeys.profiles.active(gameId) : queryKeys.profiles.activeDisabled,
    queryFn: async () => {
      if (!gameId) return null
      const profile = await getClient().data.profiles.getActive.query({ gameId })
      return profile?.id ?? null
    },
    staleTime: Infinity,
  })
  return data
}

// ---------------------------------------------------------------------------
// Installed Mods
// ---------------------------------------------------------------------------

/**
 * Per-profile mod counts for every profile of a game.
 * Used by profile dropdowns that show "N mods" next to each profile.
 */
export function useProfileModCounts(gameId: string | null): Record<string, number> {
  const { data } = useSuspenseQuery({
    queryKey: gameId ? queryKeys.mods.counts(gameId) : queryKeys.mods.countsDisabled,
    queryFn: async () => {
      if (!gameId) return {} as Record<string, number>
      const client = getClient()
      const profiles = await client.data.profiles.list.query({ gameId })
      const entries = await Promise.all(
        profiles.map(async (p) => {
          const mods = await client.data.mods.listInstalled.query({ profileId: p.id })
          return [p.id, mods.length] as const
        }),
      )
      return Object.fromEntries(entries) as Record<string, number>
    },
    staleTime: Infinity,
  })
  return data
}

// ---------------------------------------------------------------------------
// Installed Mods
// ---------------------------------------------------------------------------

const EMPTY_MODS: InstalledMod[] = []

export function useInstalledMods(profileId: string | null) {
  const { data: mods } = useSuspenseQuery({
    queryKey: profileId
      ? queryKeys.mods.installed(profileId)
      : queryKeys.mods.installedDisabled,
    queryFn: () =>
      profileId
        ? getClient().data.mods.listInstalled.query({ profileId })
        : EMPTY_MODS,
    staleTime: Infinity,
  })

  const isModInstalled = useCallback(
    (modId: string) => mods.some((m) => m.modId === modId),
    [mods],
  )

  const isModEnabled = useCallback(
    (modId: string) => mods.find((m) => m.modId === modId)?.enabled ?? false,
    [mods],
  )

  const getInstalledVersion = useCallback(
    (modId: string) => mods.find((m) => m.modId === modId)?.installedVersion,
    [mods],
  )

  const getDependencyWarnings = useCallback(
    (modId: string) =>
      mods.find((m) => m.modId === modId)?.dependencyWarnings ?? [],
    [mods],
  )

  return {
    mods,
    modIds: useMemo(() => mods.map((m) => m.modId), [mods]),
    isModInstalled,
    isModEnabled,
    getInstalledVersion,
    getDependencyWarnings,
  }
}
