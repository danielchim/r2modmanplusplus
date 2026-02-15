/**
 * Mutation hooks – one hook per operation, each with built-in cache invalidation.
 *
 * Each hook returns a standard React Query UseMutationResult.
 * Components use: `hook.mutate(args)` or `await hook.mutateAsync(args)`.
 */

import { useCallback } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { getClient } from "./trpc-client"
import { queryKeys } from "./query-keys"
import type { GlobalSettings, GameSettings } from "./types"

// ---------------------------------------------------------------------------
// Shared invalidation helper
// ---------------------------------------------------------------------------

function useInvalidate() {
  const qc = useQueryClient()
  return useCallback(
    (...keys: readonly (readonly unknown[])[]) =>
      Promise.all(
        keys.map((k) => qc.invalidateQueries({ queryKey: k as readonly unknown[] })),
      ),
    [qc],
  )
}

// ===========================================================================
// Game Mutations
// ===========================================================================

export function useAddGame() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (gameId: string) =>
      getClient().data.games.add.mutate({ gameId }),
    onSuccess: () =>
      invalidate(queryKeys.games.root, queryKeys.profiles.root, queryKeys.settings.root),
  })
}

export function useRemoveGame() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (gameId: string) =>
      getClient().data.games.remove.mutate({ gameId }),
    onSuccess: () =>
      invalidate(
        queryKeys.games.root,
        queryKeys.profiles.root,
        queryKeys.mods.root,
        queryKeys.settings.root,
      ),
  })
}

export function useSetDefaultGame() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (gameId: string | null) =>
      getClient().data.games.setDefault.mutate({ gameId }),
    onSuccess: () => invalidate(queryKeys.games.root),
  })
}

export function useTouchGame() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (gameId: string) =>
      getClient().data.games.touch.mutate({ gameId }),
    onSuccess: () => invalidate(queryKeys.games.root),
  })
}

// ===========================================================================
// Settings Mutations
// ===========================================================================

export function useUpdateGlobalSettings() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (updates: Partial<GlobalSettings>) =>
      getClient().data.settings.updateGlobal.mutate({ updates }),
    onSuccess: () => invalidate(queryKeys.settings.root),
  })
}

export function useUpdateGameSettings() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({
      gameId,
      updates,
    }: {
      gameId: string
      updates: Partial<GameSettings>
    }) => getClient().data.settings.updateForGame.mutate({ gameId, updates }),
    onSuccess: () => invalidate(queryKeys.settings.root),
  })
}

export function useResetGameSettings() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (gameId: string) =>
      getClient().data.settings.resetForGame.mutate({ gameId }),
    onSuccess: () => invalidate(queryKeys.settings.root),
  })
}

export function useDeleteGameSettings() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (gameId: string) =>
      getClient().data.settings.deleteForGame.mutate({ gameId }),
    onSuccess: () => invalidate(queryKeys.settings.root),
  })
}

// ===========================================================================
// Profile Mutations
// ===========================================================================

export function useEnsureDefaultProfile() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (gameId: string) =>
      getClient().data.profiles.ensureDefault.mutate({ gameId }),
    onSuccess: () => invalidate(queryKeys.profiles.root, queryKeys.mods.root),
  })
}

export function useSetActiveProfile() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({
      gameId,
      profileId,
    }: {
      gameId: string
      profileId: string
    }) => getClient().data.profiles.setActive.mutate({ gameId, profileId }),
    onSuccess: () => invalidate(queryKeys.profiles.root),
  })
}

export function useCreateProfile() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ gameId, name }: { gameId: string; name: string }) =>
      getClient().data.profiles.create.mutate({ gameId, name }),
    onSuccess: () => invalidate(queryKeys.profiles.root, queryKeys.mods.root),
  })
}

export function useRenameProfile() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({
      gameId,
      profileId,
      newName,
    }: {
      gameId: string
      profileId: string
      newName: string
    }) =>
      getClient().data.profiles.rename.mutate({ gameId, profileId, newName }),
    onSuccess: () => invalidate(queryKeys.profiles.root),
  })
}

export function useDeleteProfile() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({
      gameId,
      profileId,
    }: {
      gameId: string
      profileId: string
    }) => getClient().data.profiles.remove.mutate({ gameId, profileId }),
    onSuccess: () => invalidate(queryKeys.profiles.root, queryKeys.mods.root),
  })
}

export function useResetGameProfiles() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (gameId: string) =>
      getClient().data.profiles.reset.mutate({ gameId }),
    onSuccess: () => invalidate(queryKeys.profiles.root, queryKeys.mods.root),
  })
}

export function useRemoveGameProfiles() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (gameId: string) =>
      getClient().data.profiles.removeAll.mutate({ gameId }),
    onSuccess: () => invalidate(queryKeys.profiles.root, queryKeys.mods.root),
  })
}

// ===========================================================================
// Mod Mutations
// ===========================================================================

export function useMarkModInstalled() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({
      profileId,
      modId,
      version,
    }: {
      profileId: string
      modId: string
      version: string
    }) => getClient().data.mods.install.mutate({ profileId, modId, version }),
    onSuccess: () => invalidate(queryKeys.mods.root),
  })
}

export function useMarkModUninstalled() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({
      profileId,
      modId,
    }: {
      profileId: string
      modId: string
    }) => getClient().data.mods.uninstall.mutate({ profileId, modId }),
    onSuccess: () => invalidate(queryKeys.mods.root),
  })
}

export function useUninstallAllMods() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (profileId: string) =>
      getClient().data.mods.uninstallAll.mutate({ profileId }),
    onSuccess: () => invalidate(queryKeys.mods.root),
  })
}

export function useEnableMod() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({
      profileId,
      modId,
    }: {
      profileId: string
      modId: string
    }) => getClient().data.mods.enable.mutate({ profileId, modId }),
    onSuccess: () => invalidate(queryKeys.mods.root),
  })
}

export function useDisableMod() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({
      profileId,
      modId,
    }: {
      profileId: string
      modId: string
    }) => getClient().data.mods.disable.mutate({ profileId, modId }),
    onSuccess: () => invalidate(queryKeys.mods.root),
  })
}

export function useToggleMod() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({
      profileId,
      modId,
    }: {
      profileId: string
      modId: string
    }) => getClient().data.mods.toggle.mutate({ profileId, modId }),
    onSuccess: () => invalidate(queryKeys.mods.root),
  })
}

export function useSetDependencyWarnings() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({
      profileId,
      modId,
      warnings,
    }: {
      profileId: string
      modId: string
      warnings: string[]
    }) =>
      getClient().data.mods.setDependencyWarnings.mutate({
        profileId,
        modId,
        warnings,
      }),
    onSuccess: () => invalidate(queryKeys.mods.root),
  })
}

export function useClearDependencyWarnings() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({
      profileId,
      modId,
    }: {
      profileId: string
      modId: string
    }) =>
      getClient().data.mods.clearDependencyWarnings.mutate({
        profileId,
        modId,
      }),
    onSuccess: () => invalidate(queryKeys.mods.root),
  })
}

export function useDeleteProfileModState() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (profileId: string) =>
      getClient().data.mods.deleteProfileState.mutate({ profileId }),
    onSuccess: () => invalidate(queryKeys.mods.root),
  })
}

// ===========================================================================
// Compound: Unmanage Game
// ===========================================================================

export function useUnmanageGame() {
  const invalidate = useInvalidate()

  return useMutation({
    mutationFn: async (gameId: string) => {
      const client = getClient()
      const profiles = await client.data.profiles.list.query({ gameId })
      await Promise.all(
        profiles.map((p) =>
          client.data.mods.deleteProfileState.mutate({ profileId: p.id }),
        ),
      )
      await client.data.profiles.removeAll.mutate({ gameId })
      await client.data.settings.deleteForGame.mutate({ gameId })
      return client.data.games.remove.mutate({ gameId })
    },
    onSuccess: () =>
      invalidate(
        queryKeys.games.root,
        queryKeys.profiles.root,
        queryKeys.mods.root,
        queryKeys.settings.root,
      ),
  })
}
