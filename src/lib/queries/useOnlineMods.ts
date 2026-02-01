/**
 * Hooks for fetching online mods from Thunderstore
 * Conditional on Electron environment
 * 
 * IMPORTANT: These hooks use conditional tRPC hook calls which normally
 * violate Rules of Hooks. However, the isElectron check is stable and
 * never changes during the lifetime of the app, so it's safe in this case.
 */
import { useEffect } from "react"

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
 * 
 * WARNING: This hook conditionally calls tRPC hooks based on isElectron.
 * This is safe because isElectron never changes during app lifetime.
 */
export function useOnlineMods(params: UseOnlineModsParams) {
  const { gameId, query, section = "all", sort = "updated", limit = 20, enabled = true } = params

  // Get package index URL from ecosystem
  const ecosystem = getEcosystemEntry(gameId)
  const packageIndexUrl = ecosystem?.r2modman?.[0]?.packageIndex

  // Check if we're in Electron mode (this value is stable for app lifetime)
  const isElectron = hasElectronTRPC()

  // Only use the query if we're in Electron and have a package index URL
  const shouldFetch = isElectron && enabled && !!packageIndexUrl

  // Conditional hook call - safe because isElectron is stable
  if (!isElectron) {
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

  // eslint-disable-next-line react-hooks/rules-of-hooks
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
      maxPages: 20, // Cap at 20 pages (20 * limit items) to prevent unbounded memory growth
    }
  )

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!result.isError) return
    const error = result.error
    const message = error instanceof Error ? error.message : String(error)
    console.error("[OnlineMods] Failed to load mods:", message, error)
  }, [result.isError, result.error])

  return {
    ...result,
    isElectron: true,
  }
}

/**
 * Hook for fetching a single package by UUID
 * Only works in Electron mode
 * 
 * WARNING: This hook conditionally calls tRPC hooks based on isElectron.
 * This is safe because isElectron never changes during app lifetime.
 */
export function useOnlinePackage(gameId: string, uuid4: string, enabled = true) {
  // Get package index URL from ecosystem
  const ecosystem = getEcosystemEntry(gameId)
  const packageIndexUrl = ecosystem?.r2modman?.[0]?.packageIndex

  // Check if we're in Electron mode (stable for app lifetime)
  const isElectron = hasElectronTRPC()

  // Only use the query if we're in Electron and have a package index URL
  const shouldFetch = isElectron && enabled && !!packageIndexUrl && !!uuid4

  // Conditional hook call - safe because isElectron is stable
  if (!isElectron) {
    return {
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: async () => ({ data: undefined }),
      isElectron: false,
    }
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
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
      placeholderData: (previousData) => previousData, // Keep previous mod data while fetching new one
    }
  )

  return {
    ...result,
    isElectron: true,
  }
}

/**
 * Hook for fetching README HTML from Thunderstore
 * Only works in Electron mode
 * 
 * WARNING: This hook conditionally calls tRPC hooks based on isElectron.
 * This is safe because isElectron never changes during app lifetime.
 */
export function useOnlineReadme(owner: string, name: string, enabled = true) {
  // Check if we're in Electron mode (stable for app lifetime)
  const isElectron = hasElectronTRPC()

  // Only use the query if we're in Electron
  const shouldFetch = isElectron && enabled && !!owner && !!name

  // Conditional hook call - safe because isElectron is stable
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

  // eslint-disable-next-line react-hooks/rules-of-hooks
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

  return {
    ...result,
    isElectron: true,
  }
}

/**
 * Parameters for resolving dependencies
 */
export interface UseOnlineDependenciesParams {
  gameId: string
  dependencies: string[]
  installedVersions: Record<string, string>
  enforceVersions: boolean
  enabled?: boolean
}

/**
 * Hook for resolving dependencies for Thunderstore mods
 * Only works in Electron mode - returns empty array in web mode
 * 
 * WARNING: This hook conditionally calls tRPC hooks based on isElectron.
 * This is safe because isElectron never changes during app lifetime.
 */
export function useOnlineDependencies(params: UseOnlineDependenciesParams) {
  const { gameId, dependencies, installedVersions, enforceVersions, enabled = true } = params

  // Get package index URL from ecosystem
  const ecosystem = getEcosystemEntry(gameId)
  const packageIndexUrl = ecosystem?.r2modman?.[0]?.packageIndex

  // Check if we're in Electron mode (stable for app lifetime)
  const isElectron = hasElectronTRPC()

  // Only use the query if we're in Electron and have a package index URL
  const shouldFetch = isElectron && enabled && !!packageIndexUrl && dependencies.length > 0

  // Conditional hook call - safe because isElectron is stable
  if (!isElectron) {
    return {
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: async () => ({ data: [] }),
      isElectron: false,
    }
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const result = trpc.thunderstore.resolveDependencies.useQuery(
    {
      packageIndexUrl: packageIndexUrl || "",
      gameId,
      dependencies,
      installedVersions,
      enforceVersions,
    },
    {
      enabled: shouldFetch,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  return {
    ...result,
    isElectron: true,
  }
}

/**
 * Hook for fetching catalog categories with counts
 * Only works in Electron mode - returns empty data in web mode
 * 
 * WARNING: This hook conditionally calls tRPC hooks based on isElectron.
 * This is safe because isElectron never changes during app lifetime.
 */
export function useOnlineCategories(gameId: string, section: "all" | "mod" | "modpack" = "all", enabled = true) {
  // Get package index URL from ecosystem
  const ecosystem = getEcosystemEntry(gameId)
  const packageIndexUrl = ecosystem?.r2modman?.[0]?.packageIndex

  // Check if we're in Electron mode (stable for app lifetime)
  const isElectron = hasElectronTRPC()

  // Only use the query if we're in Electron and have a package index URL
  const shouldFetch = isElectron && enabled && !!packageIndexUrl

  // Conditional hook call - safe because isElectron is stable
  if (!isElectron) {
    return {
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: async () => ({ data: undefined }),
      isElectron: false,
    }
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const result = trpc.thunderstore.getCategories.useQuery(
    {
      packageIndexUrl: packageIndexUrl || "",
      section,
    },
    {
      enabled: shouldFetch,
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
    }
  )

  return {
    ...result,
    isElectron: true,
  }
}

/**
 * Hook for fetching catalog build status
 * Only works in Electron mode - returns null in web mode
 * 
 * WARNING: This hook conditionally calls tRPC hooks based on isElectron.
 * This is safe because isElectron never changes during app lifetime.
 */
export function useCatalogStatus(gameId: string, enabled = true) {
  // Get package index URL from ecosystem
  const ecosystem = getEcosystemEntry(gameId)
  const packageIndexUrl = ecosystem?.r2modman?.[0]?.packageIndex

  // Check if we're in Electron mode (stable for app lifetime)
  const isElectron = hasElectronTRPC()

  // Only use the query if we're in Electron and have a package index URL
  const shouldFetch = isElectron && enabled && !!packageIndexUrl

  // Conditional hook call - safe because isElectron is stable
  if (!isElectron) {
    return {
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      refetch: async () => ({ data: null }),
      isElectron: false,
    }
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const result = trpc.thunderstore.getCatalogStatus.useQuery(
    {
      packageIndexUrl: packageIndexUrl || "",
    },
    {
      enabled: shouldFetch,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      refetchInterval: (data: any) => {
        // Poll every 2 seconds while building, stop when ready/error
        if (data?.status === "building") {
          return 2000
        }
        return false
      },
      refetchOnWindowFocus: false,
      staleTime: 0, // Always fetch fresh status
    }
  )

  return {
    ...result,
    isElectron: true,
  }
}
