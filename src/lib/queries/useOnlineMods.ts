/**
 * Hooks for fetching online mods from Thunderstore
 * Conditional on Electron environment
 */
import { trpc, hasElectronTRPC } from "@/lib/trpc"
import { getEcosystemEntry } from "@/lib/ecosystem"

/**
 * Parameters for searching online mods
 */
export interface UseOnlineModsParams {
  gameId: string
  query?: string
  section?: "all" | "mod" | "modpack"
  sort?: "name" | "downloads" | "updated"
  limit?: number
  enabled?: boolean
}

/**
 * Hook for fetching online mods with infinite scrolling
 * Only works in Electron mode - returns empty data in web mode
 */
export function useOnlineMods(params: UseOnlineModsParams) {
  const { gameId, query, section = "all", sort = "updated", limit = 20, enabled = true } = params

  // Get package index URL from ecosystem
  const ecosystem = getEcosystemEntry(gameId)
  const packageIndexUrl = ecosystem?.r2modman?.[0]?.packageIndex

  // Check if we're in Electron mode
  const isElectron = hasElectronTRPC()

  // Only use the query if we're in Electron and have a package index URL
  const shouldFetch = isElectron && enabled && !!packageIndexUrl

  const result = trpc.thunderstore.searchPackages.useInfiniteQuery(
    {
      packageIndexUrl: packageIndexUrl || "",
      gameId,
      query,
      section,
      sort,
      limit,
    },
    {
      enabled: shouldFetch,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  // If not in Electron mode, return empty data
  if (!isElectron || !packageIndexUrl) {
    return {
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      fetchNextPage: async () => {},
      hasNextPage: false,
      isFetchingNextPage: false,
      refetch: async () => ({ data: undefined }),
      isElectron: false,
    }
  }

  return {
    ...result,
    isElectron: true,
  }
}

/**
 * Hook for fetching a single package by UUID
 * Only works in Electron mode
 */
export function useOnlinePackage(gameId: string, uuid4: string, enabled = true) {
  // Get package index URL from ecosystem
  const ecosystem = getEcosystemEntry(gameId)
  const packageIndexUrl = ecosystem?.r2modman?.[0]?.packageIndex

  // Check if we're in Electron mode
  const isElectron = hasElectronTRPC()

  // Only use the query if we're in Electron and have a package index URL
  const shouldFetch = isElectron && enabled && !!packageIndexUrl && !!uuid4

  const result = trpc.thunderstore.getPackage.useQuery(
    {
      packageIndexUrl: packageIndexUrl || "",
      gameId,
      uuid4,
    },
    {
      enabled: shouldFetch,
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  )

  // If not in Electron mode, return empty data
  if (!isElectron || !packageIndexUrl) {
    return {
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: async () => ({ data: undefined }),
      isElectron: false,
    }
  }

  return {
    ...result,
    isElectron: true,
  }
}

/**
 * Hook for fetching README HTML from Thunderstore
 * Only works in Electron mode
 */
export function useOnlineReadme(owner: string, name: string, enabled = true) {
  // Check if we're in Electron mode
  const isElectron = hasElectronTRPC()

  // Only use the query if we're in Electron
  const shouldFetch = isElectron && enabled && !!owner && !!name

  const result = trpc.thunderstore.getReadme.useQuery(
    {
      owner,
      name,
    },
    {
      enabled: shouldFetch,
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  )

  // If not in Electron mode, return empty data
  if (!isElectron) {
    return {
      data: "",
      isLoading: false,
      isError: false,
      error: null,
      refetch: async () => ({ data: "" }),
      isElectron: false,
    }
  }

  return {
    ...result,
    isElectron: true,
  }
}
