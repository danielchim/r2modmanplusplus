import { useMemo, useState, useEffect, useCallback, useRef, useLayoutEffect, memo } from "react"
import { Search, SlidersHorizontal, MoreVertical, ChevronDown, Plus, Grid3x3, List, Loader2, X } from "lucide-react"
import { useVirtualizer } from "@tanstack/react-virtual"

import { useAppStore } from "@/store/app-store"
import { useProfileStore, type Profile } from "@/store/profile-store"
import { useModManagementStore } from "@/store/mod-management-store"
import { useSettingsStore } from "@/store/settings-store"
import { MODS } from "@/mocks/mods"
import { ECOSYSTEM_GAMES } from "@/lib/ecosystem-games"
import { MOD_CATEGORIES } from "@/mocks/mod-categories"
import { useOnlineMods, useOnlinePackage, useOnlineCategories } from "@/lib/queries/useOnlineMods"
import { trpc, hasElectronTRPC } from "@/lib/trpc"
import { openFolder } from "@/lib/desktop"
import { getExeNames, getEcosystemEntry } from "@/lib/ecosystem"
import { parseModSearch } from "@/lib/mod-search"
import type { Mod } from "@/types/mod"
import { toast } from "sonner"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

// Stable fallback constants to avoid creating new references in selectors
const EMPTY_PROFILES: readonly Profile[] = []
const EMPTY_SET = new Set<string>()

// Helper: Check if a modId is a Thunderstore UUID (36 chars with hyphens)
function isThunderstoreUuid(modId: string): boolean {
  return modId.length === 36 && modId.includes("-")
}

// Create MODS_BY_ID lookup map
const MODS_BY_ID = new Map(MODS.map(m => [m.id, m]))

// Helper: Create a placeholder mod for installed mods without metadata
function createPlaceholderMod(
  modId: string,
  installedVersion: string | undefined,
  selectedSection: "mod" | "modpack",
  gameId: string
): Mod {
  const versionStr = installedVersion || "unknown"
  
  return {
    id: modId,
    name: isThunderstoreUuid(modId) ? "Thunderstore package" : "Unknown installed mod",
    author: "Unknown",
    description: `ID: ${modId}${installedVersion ? ` • Installed: v${installedVersion}` : ""}`,
    version: versionStr,
    downloads: 0,
    iconUrl: "https://via.placeholder.com/256?text=?",
    kind: selectedSection, // Match current section so placeholders stay visible
    categories: [],
    gameId,
    dependencies: [],
    isInstalled: true,
    isEnabled: false,
    versions: [{
      version_number: versionStr,
      download_count: 0,
      datetime_created: new Date(0).toISOString(),
      download_url: "",
      install_url: "",
    }],
    readmeHtml: "",
    lastUpdated: new Date(0).toISOString(),
  }
}

// Component for rendering UUID mods in Installed tab (Electron only)
type InstalledUuidModCardProps = {
  gameId: string
  modId: string
  viewMode: "grid" | "list"
  section: "mod" | "modpack"
  installedVersion: string | undefined
}

function InstalledUuidModCard({ gameId, modId, viewMode, section, installedVersion }: InstalledUuidModCardProps) {
  const onlinePackageQuery = useOnlinePackage(gameId, modId, true)
  
  // While loading or error: render a placeholder
  if (onlinePackageQuery.isLoading || onlinePackageQuery.isError || !onlinePackageQuery.data) {
    const placeholderMod = createPlaceholderMod(modId, installedVersion, section, gameId)
    return viewMode === "grid" ? (
      <ModTile key={modId} mod={placeholderMod} />
    ) : (
      <ModListItem key={modId} mod={placeholderMod} />
    )
  }
  
  // Data loaded successfully: render the actual mod
  const mod = onlinePackageQuery.data
  return viewMode === "grid" ? (
    <ModTile key={mod.id} mod={mod} />
  ) : (
    <ModListItem key={mod.id} mod={mod} />
  )
}

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModTile } from "./mod-tile"
import { ModListItem } from "./mod-list-item"
import { CreateProfileDialog } from "./create-profile-dialog"
import { ModFilters } from "./mod-filters"
import { DependencyDownloadDialog } from "./dependencies/dependency-download-dialog"

// Shared dependency dialog state
type DependencyDialogState = {
  mod: Mod | null
  version: string
  open: boolean
}

// Virtualized results component to isolate scroll-driven re-renders
type ModsResultsVirtualizedProps = {
  displayMods: Mod[]
  viewMode: "grid" | "list"
  tab: "installed" | "online"
  section: "mod" | "modpack"
  selectedGameId: string
  installedVersionsMap: Record<string, string> | undefined
  isLoadingMods: boolean
  hasError: boolean
  searchQuery: string
  selectedCategories: string[]
  onlineModsQuery: {
    isElectron: boolean
    hasNextPage: boolean | undefined
    isFetchingNextPage: boolean
    fetchNextPage: () => void
    refetch: () => void
  }
}

const ModsResultsVirtualized = memo(function ModsResultsVirtualized({
  displayMods,
  viewMode,
  tab,
  section,
  selectedGameId,
  installedVersionsMap,
  isLoadingMods,
  hasError,
  searchQuery,
  selectedCategories,
  onlineModsQuery,
}: ModsResultsVirtualizedProps) {
  // Shared dependency dialog state (one dialog for all mods)
  const [dependencyDialog, setDependencyDialog] = useState<DependencyDialogState>({
    mod: null,
    version: "",
    open: false,
  })

  const handleOpenDependencyDialog = useCallback((mod: Mod, version: string) => {
    setDependencyDialog({ mod, version, open: true })
  }, [])

  const handleCloseDependencyDialog = useCallback((open: boolean) => {
    if (!open) {
      setDependencyDialog(prev => ({ ...prev, open: false }))
    }
  }, [])

  // Virtualization setup
  const scrollParentRef = useRef<HTMLDivElement>(null)
  const gridMeasureRef = useRef<HTMLDivElement>(null)
  const [gridWidth, setGridWidth] = useState(0)

  // Constants for virtualization
  const LIST_ROW_HEIGHT = 80
  const GRID_ROW_HEIGHT = 340
  const MIN_TILE_WIDTH = 200
  const GAP = 16

  // Compute column count for grid virtualization
  const columnCount = useMemo(() => {
    if (gridWidth === 0) return 4 // Default
    return Math.max(1, Math.floor((gridWidth + GAP) / (MIN_TILE_WIDTH + GAP)))
  }, [gridWidth])

  // Measure grid width on mount and resize
  useLayoutEffect(() => {
    if (!gridMeasureRef.current) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setGridWidth(entry.contentRect.width)
      }
    })

    observer.observe(gridMeasureRef.current)
    return () => observer.disconnect()
  }, [])

  // List virtualizer
  // Note: we keep both virtualizers in this component, but only let the active
  // one subscribe to scroll events. Otherwise both will respond to scroll and
  // trigger redundant re-renders.
  const listVirtualizer = useVirtualizer({
    count: viewMode === "list" ? displayMods.length : 0,
    getScrollElement: () => (viewMode === "list" ? scrollParentRef.current : null),
    estimateSize: () => LIST_ROW_HEIGHT,
    overscan: 6,
  })

  // Grid virtualizer (row-based)
  const gridRowCount = Math.ceil(displayMods.length / columnCount)
  const gridVirtualizer = useVirtualizer({
    count: viewMode === "grid" ? gridRowCount : 0,
    getScrollElement: () => (viewMode === "grid" ? scrollParentRef.current : null),
    estimateSize: () => GRID_ROW_HEIGHT,
    overscan: 4,
  })

  // Recalculate grid virtualizer when column count changes
  useLayoutEffect(() => {
    if (viewMode === "grid") {
      gridVirtualizer.measure()
    }
  }, [columnCount, viewMode, gridVirtualizer])

  return (
    <>
      <DependencyDownloadDialog
        mod={dependencyDialog.mod}
        requestedVersion={dependencyDialog.version}
        open={dependencyDialog.open}
        onOpenChange={handleCloseDependencyDialog}
      />
      <div ref={scrollParentRef} className="flex-1 overflow-y-auto" style={{ contain: "strict" }}>
        <div ref={gridMeasureRef} className="p-4 lg:p-6">
        <h2 className="mb-4 text-lg font-semibold">
          {tab === "installed"
            ? (section === "mod" ? "Installed Mods" : "Installed Modpacks")
            : (section === "mod" ? "All Mods" : "All Modpacks")
          }
        </h2>
        
        {/* Loading State */}
        {isLoadingMods && (
          <div className="flex h-[400px] items-center justify-center">
            <div className="text-center space-y-2">
              <Loader2 className="size-8 animate-spin text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">Loading {section === "mod" ? "mods" : "modpacks"}...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {hasError && !isLoadingMods && (
          <div className="flex h-[400px] items-center justify-center">
            <div className="text-center space-y-2">
              <p className="text-destructive">Failed to load {section === "mod" ? "mods" : "modpacks"}</p>
              <p className="text-sm text-muted-foreground">Please check your connection and try again</p>
              <Button variant="outline" size="sm" onClick={() => onlineModsQuery.refetch()}>
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingMods && !hasError && displayMods.length === 0 && (
          <div className="flex h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">No {section === "mod" ? "mods" : "modpacks"} found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchQuery || selectedCategories.length > 0
                  ? "Try clearing filters or adjusting your search"
                  : tab === "installed"
                    ? `No ${section === "mod" ? "mods" : "modpacks"} installed yet`
                    : `No ${section === "mod" ? "mods" : "modpacks"} available`}
              </p>
            </div>
          </div>
        )}

        {/* Grid View */}
        {!isLoadingMods && !hasError && displayMods.length > 0 && viewMode === "grid" && (
          <>
            <div
              style={{
                height: `${gridVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {gridVirtualizer.getVirtualItems().map((virtualRow) => {
                const startIndex = virtualRow.index * columnCount
                const endIndex = Math.min(startIndex + columnCount, displayMods.length)
                const rowMods = displayMods.slice(startIndex, endIndex)

                return (
                  <div
                    key={virtualRow.key}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                      willChange: "transform",
                    }}
                  >
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                      {rowMods.map((mod) => {
                        // For installed tab: check if mod is a UUID and we're in Electron
                        if (tab === "installed" && isThunderstoreUuid(mod.id) && hasElectronTRPC()) {
                          return (
                            <InstalledUuidModCard
                              key={mod.id}
                              gameId={selectedGameId}
                              modId={mod.id}
                              viewMode="grid"
                              section={section}
                              installedVersion={installedVersionsMap?.[mod.id]}
                            />
                          )
                        }
                              return <ModTile key={mod.id} mod={mod} onOpenDependencyDialog={handleOpenDependencyDialog} />
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
            {tab === "online" && onlineModsQuery.isElectron && onlineModsQuery.hasNextPage && (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onlineModsQuery.fetchNextPage()}
                  disabled={onlineModsQuery.isFetchingNextPage}
                >
                  {onlineModsQuery.isFetchingNextPage ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </>
        )}

        {/* List View */}
        {!isLoadingMods && !hasError && displayMods.length > 0 && viewMode === "list" && (
          <>
            <div
              style={{
                height: `${listVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {listVirtualizer.getVirtualItems().map((virtualRow) => {
                const mod = displayMods[virtualRow.index]
                
                return (
                  <div
                    key={virtualRow.key}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                      willChange: "transform",
                    }}
                  >
                    {/* For installed tab: check if mod is a UUID and we're in Electron */}
                    {tab === "installed" && isThunderstoreUuid(mod.id) && hasElectronTRPC() ? (
                      <InstalledUuidModCard
                        gameId={selectedGameId}
                        modId={mod.id}
                        viewMode="list"
                        section={section}
                        installedVersion={installedVersionsMap?.[mod.id]}
                      />
                          ) : (
                            <ModListItem mod={mod} onOpenDependencyDialog={handleOpenDependencyDialog} />
                          )}
                        </div>
                      )
                    })}
                  </div>
            {tab === "online" && onlineModsQuery.isElectron && onlineModsQuery.hasNextPage && (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onlineModsQuery.fetchNextPage()}
                  disabled={onlineModsQuery.isFetchingNextPage}
                >
                  {onlineModsQuery.isFetchingNextPage ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </>
  )
})

export function ModsLibrary() {
  const [createProfileOpen, setCreateProfileOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [section, setSection] = useState<"mod" | "modpack">("mod")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [filtersOpen, setFiltersOpen] = useState(true)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Reset filters to open when viewport becomes desktop-sized
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)')

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        // Desktop: ensure filters are open by default
        setFiltersOpen(true)
      }
    }

    // Set initial state
    handleChange(mediaQuery)

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const selectedGameId = useAppStore((s) => s.selectedGameId)
  const searchQuery = useAppStore((s) => s.searchQuery)
  const sortKey = useAppStore((s) => s.sortKey)
  const sortDir = useAppStore((s) => s.sortDir)
  const setSort = useAppStore((s) => s.setSort)
  const setSearchQuery = useAppStore((s) => s.setSearchQuery)
  const setShowContextPanel = useAppStore((s) => s.setShowContextPanel)
  const selectMod = useAppStore((s) => s.selectMod)
  const tab = useAppStore((s) => s.modLibraryTab)
  const setTab = useAppStore((s) => s.setModLibraryTab)
  
  // Subscribe to the installed mods Set directly for real-time updates
  const activeProfileId = useProfileStore((s) =>
    selectedGameId ? s.activeProfileIdByGame[selectedGameId] ?? null : null
  )
  const installedModsByProfile = useModManagementStore((s) => s.installedModsByProfile)
  const installedModVersionsByProfile = useModManagementStore((s) => s.installedModVersionsByProfile)
  // Use stable fallback to avoid new Set() every render
  const installedModsSet = activeProfileId ? installedModsByProfile[activeProfileId] : undefined
  const installedModsSetOrEmpty = installedModsSet ?? EMPTY_SET
  const installedVersionsMap = activeProfileId ? installedModVersionsByProfile[activeProfileId] : undefined
  
  // Avoid returning new [] in selector - return undefined and default outside
  const profilesFromStore = useProfileStore((s) =>
    selectedGameId ? s.profilesByGame[selectedGameId] ?? undefined : undefined
  )
  const profiles = profilesFromStore ?? EMPTY_PROFILES
  const createProfile = useProfileStore((s) => s.createProfile)
  const setActiveProfile = useProfileStore((s) => s.setActiveProfile)
  
  // Check if profiles are enabled (requires install folder)
  const getPerGameSettings = useSettingsStore((s) => s.getPerGame)
  const installFolder = selectedGameId ? getPerGameSettings(selectedGameId).gameInstallFolder : ""
  const profilesEnabled = installFolder?.trim().length > 0
  const exeNames = selectedGameId ? getExeNames(selectedGameId) : []
  const ecosystem = selectedGameId ? getEcosystemEntry(selectedGameId) : null
  const packageIndexUrl = ecosystem?.r2modman?.[0]?.packageIndex || ""
  
  // Launch-related queries and mutations
  const launchMutation = trpc.launch.start.useMutation()
  
  // Query to verify binary exists
  const binaryVerification = trpc.launch.verifyBinary.useQuery(
    {
      installFolder,
      exeNames,
    },
    {
      enabled: profilesEnabled && exeNames.length > 0,
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  )
  
  // Parse search query into text and author components
  const { textQuery, authorQuery } = useMemo(
    () => parseModSearch(searchQuery),
    [searchQuery]
  )
  
  // Poll launch status
  const launchStatus = trpc.launch.getStatus.useQuery(
    {
      gameId: selectedGameId || "",
    },
    {
      enabled: !!selectedGameId,
      refetchInterval: 1500, // Poll every 1.5 seconds
      refetchOnWindowFocus: true,
    }
  )

  // Helper to apply search filter to a mod
  const matchesSearch = (mod: Mod, textQuery: string, authorQuery: string | null) => {
    // Check author filter first (exact substring match, case-insensitive)
    if (authorQuery) {
      const authorLower = mod.author.toLowerCase()
      const authorQueryLower = authorQuery.toLowerCase()
      if (!authorLower.includes(authorQueryLower)) {
        return false
      }
    }
    
    // If no text query remains, author filter alone is sufficient
    if (!textQuery) return true
    
    // Apply text query (substring match across name/author/id/description)
    const lowerQuery = textQuery.toLowerCase()
    return mod.name.toLowerCase().includes(lowerQuery) ||
           mod.author.toLowerCase().includes(lowerQuery) ||
           mod.id.toLowerCase().includes(lowerQuery) ||
           mod.description.toLowerCase().includes(lowerQuery)
  }

  // Helper to sort mods by the selected sortKey and sortDir
  const sortMods = (
    mods: Mod[], 
    sortKey: "updated" | "name" | "downloads", 
    sortDir: "asc" | "desc"
  ) => {
    const sorted = [...mods]
    
    if (sortKey === "downloads") {
      sorted.sort((a, b) => {
        const cmp = (b.downloads || 0) - (a.downloads || 0)
        if (cmp !== 0) return cmp
        // Tie-breaker: modId for stable ordering
        return a.id.localeCompare(b.id)
      })
    } else if (sortKey === "updated") {
      sorted.sort((a, b) => {
        const aTime = a.lastUpdated ? Date.parse(a.lastUpdated) : 0
        const bTime = b.lastUpdated ? Date.parse(b.lastUpdated) : 0
        if (bTime !== aTime) return bTime - aTime
        // Tie-breaker: modId for stable ordering
        return a.id.localeCompare(b.id)
      })
    } else { // name
      sorted.sort((a, b) => {
        const nameCompare = (a.name || a.id).localeCompare(b.name || b.id)
        if (nameCompare !== 0) return nameCompare
        // Tie-breaker: modId for stable ordering
        return a.id.localeCompare(b.id)
      })
    }
    
    // Apply direction: default sort is desc for downloads/updated, asc for name
    // If sortDir doesn't match the natural order, reverse
    if (sortKey === "name" && sortDir === "desc") {
      return sorted.reverse()
    } else if ((sortKey === "downloads" || sortKey === "updated") && sortDir === "asc") {
      return sorted.reverse()
    }
    
    return sorted
  }

  // Installed mods (built from zustand IDs, not MODS filter)
  const installedItems = useMemo(() => {
    if (!selectedGameId || tab !== "installed") return []
    
    const installedIds = Array.from(installedModsSetOrEmpty)
    const items: Mod[] = []
    
    for (const modId of installedIds) {
      const knownMod = MODS_BY_ID.get(modId)
      const installedVersion = installedVersionsMap?.[modId]
      
      if (knownMod) {
        // Known mock mod: use directly
        items.push(knownMod)
      } else if (isThunderstoreUuid(modId)) {
        // Thunderstore UUID: placeholder (InstalledUuidModCard will fetch in Electron)
        items.push(createPlaceholderMod(modId, installedVersion, section, selectedGameId))
      } else {
        // Unknown ID: placeholder
        items.push(createPlaceholderMod(modId, installedVersion, section, selectedGameId))
      }
    }
    
    // Apply filters: section, categories, search
    let filtered = items.filter(m => m.kind === section)
    
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(m =>
        selectedCategories.some(cat => m.categories.includes(cat))
      )
    }
    
    if (searchQuery) {
      filtered = filtered.filter(m => matchesSearch(m, textQuery, authorQuery))
    }
    
    // Sort
    return sortMods(filtered, sortKey, sortDir)
  }, [selectedGameId, tab, installedModsSetOrEmpty, installedVersionsMap, section, selectedCategories, searchQuery, textQuery, authorQuery, sortKey, sortDir])

  // Filter and sort mods (for online tab in web mode)
  const filteredMods = useMemo(() => {
    if (!selectedGameId || tab === "installed") return [] // Use installedItems instead
    
    let mods = MODS.filter((m) => m.gameId === selectedGameId)

    // Section filter (kind)
    mods = mods.filter((m) => m.kind === section)

    // Category filter (OR matching)
    if (selectedCategories.length > 0) {
      mods = mods.filter((m) =>
        selectedCategories.some((cat) => m.categories.includes(cat))
      )
    }

    // Search filter
    if (searchQuery) {
      mods = mods.filter((m) => matchesSearch(m, textQuery, authorQuery))
    }

    // Sort
    return sortMods(mods, sortKey, sortDir)
  }, [selectedGameId, tab, section, selectedCategories, searchQuery, textQuery, authorQuery, sortKey, sortDir])

  // Thunderstore online mods (only when tab === "online" and in Electron)
  const onlineModsQuery = useOnlineMods({
    gameId: selectedGameId || "",
    query: searchQuery || undefined,
    section: section === "mod" ? "mod" : "modpack",
    sort: sortKey,
    limit: 50,
    enabled: tab === "online" && !!selectedGameId,
  })

  // Fetch categories from catalog (Electron only, falls back to MOD_CATEGORIES)
  const onlineCategoriesQuery = useOnlineCategories(
    selectedGameId || "",
    section === "mod" ? "mod" : "modpack",
    !!selectedGameId
  )

  // Derive categories list: use catalog data if available, otherwise fallback to static list
  const categories = useMemo(() => {
    if (onlineCategoriesQuery.isElectron && onlineCategoriesQuery.data?.categories) {
      return onlineCategoriesQuery.data.categories
    }
    // ModFilters expects a mutable string[]. Provide a copy.
    return [...MOD_CATEGORIES]
  }, [onlineCategoriesQuery.isElectron, onlineCategoriesQuery.data])

  // Compute category counts (prefer catalog counts, fallback to computed)
  const categoryCounts = useMemo(() => {
    // If we have catalog counts, use those
    if (onlineCategoriesQuery.isElectron && onlineCategoriesQuery.data?.counts) {
      return onlineCategoriesQuery.data.counts
    }

    // Otherwise compute from displayed mods
    if (!selectedGameId) return {}
    
    let baseMods: Mod[] = []
    
    if (tab === "installed") {
      // For installed tab: count from installed items (only known/fetched mods contribute)
      baseMods = installedItems.filter(m => m.kind === section)
    } else if (tab === "online" && onlineModsQuery.isElectron && onlineModsQuery.data) {
      // For online Electron tab: count from displayed Thunderstore results
      const pages = onlineModsQuery.data.pages ?? []
      baseMods = pages.flatMap(page => page.items).filter(m => m.kind === section)
    } else {
      // For online web tab: count from filtered MODS
      baseMods = MODS.filter(
        (m) => m.gameId === selectedGameId && m.kind === section
      )
    }

    const counts: Record<string, number> = {}
    baseMods.forEach((mod) => {
      mod.categories.forEach((cat) => {
        counts[cat] = (counts[cat] || 0) + 1
      })
    })

    return counts
  }, [selectedGameId, tab, installedItems, section, onlineModsQuery.isElectron, onlineModsQuery.data, onlineCategoriesQuery.isElectron, onlineCategoriesQuery.data])
  
  // Determine which mods to display based on tab and Electron status
  let displayMods: Mod[] = []
  let isLoadingMods = false
  let hasError = false
  
  if (tab === "installed") {
    // Installed tab: use installedItems (built from zustand IDs)
    displayMods = installedItems
  } else if (tab === "online" && onlineModsQuery.isElectron) {
    // Online tab in Electron: use Thunderstore data
    const pages = onlineModsQuery.data?.pages ?? []
    let mods = pages.flatMap(page => page.items)
    
    // Apply client-side category filtering (backend doesn't support this)
    if (selectedCategories.length > 0) {
      mods = mods.filter((m) =>
        selectedCategories.some((cat) => m.categories.includes(cat))
      )
    }
    
    // Apply client-side sortDir (backend only sorts by key, not direction)
    // Backend returns results sorted by sortKey in descending order by default
    // If we need ascending, reverse the results
    if (sortDir === "asc") {
      mods = mods.reverse()
    }
    
    displayMods = mods
    isLoadingMods = onlineModsQuery.isLoading
    hasError = onlineModsQuery.isError
  } else {
    // Online tab in web mode: use filtered mocks
    displayMods = filteredMods
  }

  const currentGame = ECOSYSTEM_GAMES.find((g) => g.id === selectedGameId)
  const gameProfiles = profiles.map(profile => ({
    ...profile,
    modCount: installedModsByProfile[profile.id]?.size ?? 0
  }))
  const currentProfile = gameProfiles.find((p) => p.id === activeProfileId)

  const handleCreateProfile = (profileName: string) => {
    if (!selectedGameId) return
    createProfile(selectedGameId, profileName)
  }

  const handleToggleCategory = useCallback((category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }, [])

  const handleClearCategories = useCallback(() => {
    setSelectedCategories([])
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchQuery("")
    searchInputRef.current?.focus()
  }, [setSearchQuery])

  const handleOpenGameFolder = async () => {
    if (!installFolder) return
    
    try {
      await openFolder(installFolder)
      toast.success("Opened game folder")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      toast.error("Failed to open folder", {
        description: message,
      })
    }
  }
  
  const handleStartModded = async () => {
    if (!selectedGameId || !activeProfileId || !binaryVerification.data?.exePath) return
    
    try {
      const result = await launchMutation.mutateAsync({
        gameId: selectedGameId,
        profileId: activeProfileId,
        mode: "modded",
        installFolder,
        exePath: binaryVerification.data.exePath,
        launchParameters: getPerGameSettings(selectedGameId).launchParameters || "",
        packageIndexUrl,
      })
      
      if (result.success) {
        toast.success("Game launched", {
          description: `Started in modded mode (PID: ${result.pid})`,
        })
      } else {
        toast.error("Launch failed", {
          description: result.error,
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      toast.error("Launch failed", {
        description: message,
      })
    }
  }
  
  const handleStartVanilla = async () => {
    if (!selectedGameId || !activeProfileId || !binaryVerification.data?.exePath) return
    
    try {
      const result = await launchMutation.mutateAsync({
        gameId: selectedGameId,
        profileId: activeProfileId,
        mode: "vanilla",
        installFolder,
        exePath: binaryVerification.data.exePath,
        launchParameters: getPerGameSettings(selectedGameId).launchParameters || "",
        packageIndexUrl,
      })
      
      if (result.success) {
        toast.success("Game launched", {
          description: `Started in vanilla mode (PID: ${result.pid})`,
        })
      } else {
        toast.error("Launch failed", {
          description: result.error,
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      toast.error("Launch failed", {
        description: message,
      })
    }
  }

  // Determine launch button state and tooltip
  let launchDisabled = true
  let launchTooltip = "Install folder not set"
  
  const isRunning = launchStatus.data?.running ?? false
  const isLaunching = launchMutation.isPending
  
  if (installFolder) {
    if (binaryVerification.isLoading) {
      launchDisabled = true
      launchTooltip = "Verifying game files..."
    } else if (!binaryVerification.data?.ok) {
      launchDisabled = true
      launchTooltip = binaryVerification.data?.reason || "Game binary not found"
    } else if (isRunning) {
      launchDisabled = true
      launchTooltip = "Game is running"
    } else if (isLaunching) {
      launchDisabled = true
      launchTooltip = "Launching..."
    } else {
      launchDisabled = false
      launchTooltip = ""
    }
  }

  // Handle no game selected state
  if (!selectedGameId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">No game selected</p>
          <p className="text-sm text-muted-foreground">Add a game to get started</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <CreateProfileDialog
        open={createProfileOpen}
        onOpenChange={setCreateProfileOpen}
        onCreateProfile={handleCreateProfile}
      />
      <div className="flex h-full flex-col">
        {/* Game Banner */}
        <div className="relative h-[200px] shrink-0 overflow-hidden">
          <img
            src={currentGame?.bannerUrl}
            alt={currentGame?.name}
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute bottom-4 left-6">
            <h1 className="text-3xl font-bold text-balance">{currentGame?.name}</h1>
          </div>
          <div className="absolute bottom-4 right-6 flex gap-2">
            {launchDisabled ? (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <span className="inline-block" />
                  }
                >
                  <Button 
                    variant="default" 
                    size="default"
                    disabled={launchDisabled}
                    onClick={handleStartModded}
                  >
                    Start Modded
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {launchTooltip}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button 
                variant="default" 
                size="default"
                disabled={launchDisabled}
                onClick={handleStartModded}
              >
                Start Modded
              </Button>
            )}
            {launchDisabled ? (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <span className="inline-block" />
                  }
                >
                  <Button 
                    variant="outline" 
                    size="default"
                    disabled={launchDisabled}
                    onClick={handleStartVanilla}
                  >
                    Start Vanilla
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {launchTooltip}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button 
                variant="outline" 
                size="default"
                disabled={launchDisabled}
                onClick={handleStartVanilla}
              >
                Start Vanilla
              </Button>
            )}
            <Button 
              variant="outline" 
              size="default"
              onClick={handleOpenGameFolder}
              disabled={!installFolder}
            >
              Open Game Folder
            </Button>
          </div>
        </div>

        {/* Profile Selector & Tabs */}
        <div className="shrink-0 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-4 px-6 py-3">
            <div className="flex-1 flex items-end gap-2">
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-1">Profile</div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    disabled={!profilesEnabled}
                    render={
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    }
                  >
                    <span>{profilesEnabled ? (currentProfile?.name ?? activeProfileId ?? "Default") : "Not available"}</span>
                    <ChevronDown className="size-4 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[280px] rounded-xl shadow-xl py-2 ring-1 ring-border/80"
                    align="start"
                  >
                    {/* All Profiles Section */}
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="px-3 py-2">All Profiles</DropdownMenuLabel>
                      <DropdownMenuRadioGroup
                        value={activeProfileId ?? ""}
                        onValueChange={(profileId) => setActiveProfile(selectedGameId, profileId)}
                      >
                        {gameProfiles.map((profile) => (
                          <DropdownMenuRadioItem
                            key={profile.id}
                            value={profile.id}
                            className="mx-1 gap-3 rounded-md px-3 py-2"
                          >
                            <span>{profile.name}</span>
                            <span className="ml-auto text-xs text-muted-foreground">{profile.modCount} mods</span>
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator className="mx-0 my-2" />

                    {/* Create New Profile Section */}
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        className="mx-1 gap-3 rounded-md px-3 py-2"
                        onClick={() => setCreateProfileOpen(true)}
                      >
                        <Plus className="size-5" />
                        <span>Create new profile</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="More options"
                  onClick={() => {
                    selectMod(null) // Clear selected mod to show game dashboard
                    setShowContextPanel(true)
                  }}
                >
                  <MoreVertical className="size-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex gap-1 px-6">
            <Button
              variant="ghost"
              size="sm"
              className={tab === "installed" ? "rounded-b-none border-b-2 border-primary" : "rounded-b-none"}
              onClick={() => setTab("installed")}
            >
              Installed
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={tab === "online" ? "rounded-b-none border-b-2 border-primary" : "rounded-b-none"}
              onClick={() => setTab("online")}
            >
              Online
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="shrink-0 border-b border-border bg-card px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchQuery.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            {/* View Mode Toggle */}
            <div className="flex gap-1 border border-border rounded-md">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="rounded-r-none"
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                <Grid3x3 className="size-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="rounded-l-none"
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                <List className="size-4" />
              </Button>
            </div>

            {/* Mobile Filter Button (Sheet Trigger) */}
            <Sheet>
              <SheetTrigger
                className="lg:hidden inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-border bg-background hover:bg-accent hover:text-accent-foreground size-9"
                aria-label="Filter"
              >
                <SlidersHorizontal className="size-4" />
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[280px]">
                <ModFilters
                  section={section}
                  onSectionChange={setSection}
                  categories={categories}
                  selectedCategories={selectedCategories}
                  onToggleCategory={handleToggleCategory}
                  onClearCategories={handleClearCategories}
                  categoryCounts={categoryCounts}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSortChange={setSort}
                />
              </SheetContent>
            </Sheet>

            {/* Desktop Filter Toggle Button */}
            <Button
              variant="outline"
              size="icon"
              aria-label="Filter"
              className="hidden lg:inline-flex"
              onClick={() => setFiltersOpen((v) => !v)}
            >
              <SlidersHorizontal className="size-4" />
            </Button>
          </div>
        </div>

        {/* Content Area: Filter Sidebar + Results */}
        <div className="flex flex-1 overflow-hidden">
          {/* Filter Sidebar - Desktop Only */}
          {filtersOpen && (
            <div className="hidden lg:block w-[280px] shrink-0">
              <ModFilters
                section={section}
                onSectionChange={setSection}
                categories={categories}
                selectedCategories={selectedCategories}
                onToggleCategory={handleToggleCategory}
                onClearCategories={handleClearCategories}
                categoryCounts={categoryCounts}
                sortKey={sortKey}
                sortDir={sortDir}
                onSortChange={setSort}
              />
            </div>
          )}

          {/* Results Area */}
          <ModsResultsVirtualized
            displayMods={displayMods}
            viewMode={viewMode}
            tab={tab}
            section={section}
            selectedGameId={selectedGameId}
            installedVersionsMap={installedVersionsMap}
            isLoadingMods={isLoadingMods}
            hasError={hasError}
            searchQuery={searchQuery}
            selectedCategories={selectedCategories}
            onlineModsQuery={{
              isElectron: onlineModsQuery.isElectron,
              hasNextPage: onlineModsQuery.hasNextPage,
              isFetchingNextPage: onlineModsQuery.isFetchingNextPage,
              fetchNextPage: onlineModsQuery.fetchNextPage,
              refetch: onlineModsQuery.refetch,
            }}
          />
        </div>
      </div>
    </>
  )
}
