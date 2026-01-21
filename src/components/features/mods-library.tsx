import { useMemo, useState, useEffect } from "react"
import { Search, SlidersHorizontal, MoreVertical, ChevronDown, Plus, Grid3x3, List } from "lucide-react"

import { useAppStore } from "@/store/app-store"
import { useProfileStore } from "@/store/profile-store"
import { useModManagementStore } from "@/store/mod-management-store"
import { MODS } from "@/mocks/mods"
import { GAMES } from "@/mocks/games"
import { PROFILES } from "@/mocks/profiles"
import { MOD_CATEGORIES } from "@/mocks/mod-categories"
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

export function ModsLibrary() {
  const [createProfileOpen, setCreateProfileOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [section, setSection] = useState<"mod" | "modpack">("mod")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [filtersOpen, setFiltersOpen] = useState(true)

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
  const sortBy = useAppStore((s) => s.sortBy)
  const setSearchQuery = useAppStore((s) => s.setSearchQuery)
  const setShowContextPanel = useAppStore((s) => s.setShowContextPanel)
  const selectMod = useAppStore((s) => s.selectMod)
  const tab = useAppStore((s) => s.modLibraryTab)
  const setTab = useAppStore((s) => s.setModLibraryTab)
  
  // Early return if no game selected
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
  
  // Subscribe to the installed mods Set directly for real-time updates
  const installedModsSet = useModManagementStore((s) => s.installedModsByGame[selectedGameId])
  
  const activeProfileId = useProfileStore(
    (s) => s.activeProfileIdByGame[selectedGameId]
  )
  const setActiveProfile = useProfileStore((s) => s.setActiveProfile)

  const currentGame = GAMES.find((g) => g.id === selectedGameId)
  const gameProfiles = PROFILES.filter((p) => p.gameId === selectedGameId)
  const currentProfile = gameProfiles.find((p) => p.id === activeProfileId)

  const handleCreateProfile = (profileName: string) => {
    // TODO: Implement actual profile creation logic
    console.log("Creating profile:", profileName, "for game:", selectedGameId)
    // For now, just log it - you'll need to implement the actual creation in the profile store
  }

  const handleToggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  const handleClearCategories = () => {
    setSelectedCategories([])
  }

  // Filter and sort mods
  const filteredMods = useMemo(() => {
    let mods = MODS.filter((m) => m.gameId === selectedGameId)

    // Tab filter: Installed vs Online
    if (tab === "installed") {
      mods = mods.filter((m) => installedModsSet?.has(m.id))
    }
    // For "online" tab, show all mods

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
      const query = searchQuery.toLowerCase()
      mods = mods.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.author.toLowerCase().includes(query) ||
          m.description.toLowerCase().includes(query)
      )
    }

    // Sort
    if (sortBy === "downloads") {
      mods = mods.sort((a, b) => b.downloads - a.downloads)
    } else if (sortBy === "updated") {
      mods = mods.sort(
        (a, b) =>
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      )
    } else {
      mods = mods.sort((a, b) => a.name.localeCompare(b.name))
    }

    return mods
  }, [selectedGameId, tab, section, selectedCategories, searchQuery, sortBy, installedModsSet])

  // Compute category counts (ignoring selectedCategories to show availability)
  const categoryCounts = useMemo(() => {
    let baseMods = MODS.filter(
      (m) => m.gameId === selectedGameId && m.kind === section
    )

    // Apply tab filter to counts as well
    if (tab === "installed") {
      baseMods = baseMods.filter((m) => installedModsSet?.has(m.id))
    }

    const counts: Record<string, number> = {}
    baseMods.forEach((mod) => {
      mod.categories.forEach((cat) => {
        counts[cat] = (counts[cat] || 0) + 1
      })
    })

    return counts
  }, [selectedGameId, section, tab, installedModsSet])

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
            <Button variant="default" size="default">
              Start Modded
            </Button>
            <Button variant="outline" size="default">
              Start Vanilla
            </Button>
            <Button variant="outline" size="default">
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
                    render={
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    }
                  >
                    <span>{currentProfile?.name ?? activeProfileId ?? "Default"}</span>
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
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
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
                  categories={[...MOD_CATEGORIES]}
                  selectedCategories={selectedCategories}
                  onToggleCategory={handleToggleCategory}
                  onClearCategories={handleClearCategories}
                  categoryCounts={categoryCounts}
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
                categories={[...MOD_CATEGORIES]}
                selectedCategories={selectedCategories}
                onToggleCategory={handleToggleCategory}
                onClearCategories={handleClearCategories}
                categoryCounts={categoryCounts}
              />
            </div>
          )}

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 lg:p-6">
              <h2 className="mb-4 text-lg font-semibold">
                {tab === "installed"
                  ? (section === "mod" ? "Installed Mods" : "Installed Modpacks")
                  : (section === "mod" ? "All Mods" : "All Modpacks")
                }
              </h2>
              {filteredMods.length === 0 ? (
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
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                  {filteredMods.map((mod) => (
                    <ModTile key={mod.id} mod={mod} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {filteredMods.map((mod) => (
                    <ModListItem key={mod.id} mod={mod} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
