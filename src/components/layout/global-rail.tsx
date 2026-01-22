import { useState, useEffect } from "react"
import { Home, Box, Globe, Settings as SettingsIcon, Download, User, ChevronDown, Plus } from "lucide-react"
import { Link, useRouterState } from "@tanstack/react-router"

import { useAppStore } from "@/store/app-store"
import { useProfileStore } from "@/store/profile-store"
import { useGameManagementStore } from "@/store/game-management-store"
import { GAMES } from "@/mocks/games"
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
import { AddGameDialog } from "@/components/features/add-game-dialog"
import { cn } from "@/lib/utils"

interface GlobalRailContentProps {
  onNavigate?: () => void
}

export function GlobalRailContent({ onNavigate }: GlobalRailContentProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [addGameOpen, setAddGameOpen] = useState(false)
  
  const selectedGameId = useAppStore((s) => s.selectedGameId)
  const selectGame = useAppStore((s) => s.selectGame)
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen)
  const settingsOpen = useAppStore((s) => s.settingsOpen)
  const setModLibraryTab = useAppStore((s) => s.setModLibraryTab)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const activeProfileId = selectedGameId ? useProfileStore((s) => s.activeProfileIdByGame[selectedGameId]) : null
  const profilesByGame = useProfileStore((s) => s.profilesByGame)
  const recentManagedGameIds = useGameManagementStore((s) => s.recentManagedGameIds)
  const defaultGameId = useGameManagementStore((s) => s.defaultGameId)
  const managedGameIds = useGameManagementStore((s) => s.managedGameIds)
  const setDefaultGameId = useGameManagementStore((s) => s.setDefaultGameId)
  
  // Get active profile name
  const activeProfile = selectedGameId && activeProfileId 
    ? profilesByGame[selectedGameId]?.find(p => p.id === activeProfileId)
    : null
  const activeProfileName = activeProfile?.name ?? "No profile"
  
  // Force open Add Game dialog on first run or after all games are removed
  useEffect(() => {
    const noGames = defaultGameId === null && managedGameIds.length === 0
    // Only show if no games AND settings is not open
    if (noGames && !settingsOpen) {
      setAddGameOpen(true)
    }
  }, [defaultGameId, managedGameIds.length, settingsOpen])
  
  const selectedGame = selectedGameId ? GAMES.find((g) => g.id === selectedGameId) : null
  
  // Managed games for the dropdown
  const managedGames = managedGameIds
    .map((id) => GAMES.find((g) => g.id === id))
    .filter((g): g is typeof GAMES[number] => g !== undefined)
  
  // Recently managed games (newest first, max 3, filtered to managed only)
  const recentGames = recentManagedGameIds
    .filter((id) => managedGameIds.includes(id))
    .slice()
    .reverse()
    .slice(0, 3)
    .map((id) => GAMES.find((g) => g.id === id))
    .filter((g): g is typeof GAMES[number] => g !== undefined)

  return (
    <>
      <AddGameDialog 
        open={addGameOpen} 
        onOpenChange={setAddGameOpen}
        forceOpen={defaultGameId === null && managedGameIds.length === 0}
      />
      <div className="flex h-full w-full flex-col bg-card min-h-0">
      {/* Top Section: Game Selector */}
      <div className="shrink-0 border-b border-border">
        {selectedGame ? (
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="w-full rounded-none border-none p-4 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                />
              }
            >
              <div className="flex items-center gap-3">
                <img
                  src={selectedGame.bannerUrl}
                  alt={selectedGame.name}
                  className="size-16 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h1 className="text-sm font-semibold truncate">{selectedGame.name}</h1>
                  <p className="text-xs text-muted-foreground truncate">
                    {activeProfileName}
                  </p>
                </div>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-[288px] max-h-[80vh] flex flex-col rounded-xl shadow-xl py-2 ring-1 ring-border/80" 
              align="start"
              sideOffset={-90}
            >
              {/* Header Section: Current Game + Profile */}
              <DropdownMenuGroup>
                <DropdownMenuLabel className="p-0 font-normal text-foreground">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <img
                      src={selectedGame.bannerUrl}
                      alt={selectedGame.name}
                      className="size-14 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{selectedGame.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {activeProfileName}
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator className="mx-0 my-2" />
              
              {/* Games List Section - Scrollable */}
              <div className="overflow-y-auto flex-1 min-h-0">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-3 py-2">Games</DropdownMenuLabel>
                  {managedGames.length === 0 ? (
                    <div className="px-3 py-6 text-center">
                      <p className="text-xs text-muted-foreground">No games added yet</p>
                    </div>
                  ) : (
                    <DropdownMenuRadioGroup
                      value={selectedGameId ?? undefined}
                      onValueChange={(nextId) => {
                        selectGame(nextId)
                        setDefaultGameId(nextId)
                        setMenuOpen(false)
                        onNavigate?.()
                      }}
                    >
                      {managedGames.map((game) => (
                        <DropdownMenuRadioItem 
                          key={game.id} 
                          value={game.id} 
                          className="mx-1 gap-3 rounded-md px-3 py-2"
                        >
                          <img
                            src={game.bannerUrl}
                            alt=""
                            className="size-10 rounded object-cover"
                          />
                          <span>{game.name}</span>
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  )}
                </DropdownMenuGroup>
                
                <DropdownMenuSeparator className="mx-0 my-2" />
                
                {/* Add Game Section */}
                <DropdownMenuGroup>
                  <DropdownMenuItem 
                    className="mx-1 gap-3 rounded-md px-3 py-2"
                    onClick={() => {
                      setMenuOpen(false)
                      setAddGameOpen(true)
                    }}
                  >
                    <Plus className="size-5" />
                    <span>Add game</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button
            type="button"
            onClick={() => setAddGameOpen(true)}
            className="w-full rounded-none border-none p-4 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
          >
            <div className="flex items-center gap-3">
              <div className="size-16 rounded bg-muted flex items-center justify-center">
                <Plus className="size-8 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-sm font-semibold">No game selected</h1>
                <p className="text-xs text-muted-foreground">Click to add a game</p>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Middle Section: Navigation */}
      <div className="shrink-0 p-2">
        <nav className="space-y-1">
          <Link to="/" onClick={() => onNavigate?.()}>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-start gap-2",
                pathname === "/" && "bg-muted"
              )}
            >
              <Home className="size-4" />
              <span className="text-sm">Home</span>
            </Button>
          </Link>
          <Link to="/" onClick={() => {
            setModLibraryTab("installed")
            onNavigate?.()
          }}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
            >
              <Box className="size-4" />
              <span className="text-sm">Installed Mods</span>
            </Button>
          </Link>
          <Link to="/" onClick={() => {
            setModLibraryTab("online")
            onNavigate?.()
          }}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
            >
              <Globe className="size-4" />
              <span className="text-sm">Online Mods</span>
            </Button>
          </Link>
          <Link to="/config-editor" onClick={() => onNavigate?.()}>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-start gap-2",
                pathname === "/config-editor" && "bg-muted"
              )}
            >
              <SettingsIcon className="size-4" />
              <span className="text-sm">Config Editor</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => {
              setSettingsOpen(true)
              onNavigate?.()
            }}
          >
            <SettingsIcon className="size-4" />
            <span className="text-sm">Settings</span>
          </Button>
        </nav>
      </div>

      {/* Recently Managed Section - Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2">
        <div className="mb-2 px-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Recently Managed
          </h2>
        </div>
        {recentGames.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <p className="text-xs text-muted-foreground">
              No recently managed games yet
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {recentGames.map((game) => (
              <button
                key={`recent-${game.id}`}
                onClick={() => {
                  selectGame(game.id)
                  setDefaultGameId(game.id)
                  onNavigate?.()
                }}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <img
                  src={game.bannerUrl}
                  alt={game.name}
                  className="size-12 rounded object-cover"
                />
                <span className="text-xs text-muted-foreground">{game.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Section: Downloads & User - Pinned */}
      <div className="shrink-0 border-t border-border p-2">
        <Link to="/downloads" className="block" onClick={() => onNavigate?.()}>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full justify-start gap-2",
              pathname === "/downloads" && "bg-muted"
            )}
          >
            <Download className="size-4" />
            <span className="text-sm">Downloads</span>
          </Button>
        </Link>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
          <User className="size-4" />
          <span className="text-sm">SynapseCharlie</span>
        </Button>
      </div>
    </div>
    </>
  )
}

export function GlobalRail() {
  return (
    <div className="flex w-[240px] h-full shrink-0 flex-col border-r border-border">
      <GlobalRailContent />
    </div>
  )
}
