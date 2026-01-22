import { useState, useEffect } from "react"
import { useAppStore } from "@/store/app-store"
import { useGameManagementStore } from "@/store/game-management-store"
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"
import { XIcon, PlusIcon } from "lucide-react"
import { LocationsPanel } from "./panels/locations-panel"
import { DownloadsPanel } from "./panels/downloads-panel"
import { DebuggingPanel } from "./panels/debugging-panel"
import { ModpacksPanel } from "./panels/modpacks-panel"
import { OtherPanel } from "./panels/other-panel"
import { GameSettingsPanel } from "./panels/game-settings-panel"
import { AddGameDialog } from "@/components/features/add-game-dialog"
import { GAMES } from "@/mocks/games"
import { cn } from "@/lib/utils"

const staticNavigationSections = [
  {
    title: "General",
    items: [
      { id: "other", label: "Appearance", component: OtherPanel },
    ],
  },
  {
    title: "Mods",
    items: [
      { id: "locations", label: "Locations", component: LocationsPanel },
      { id: "downloads", label: "Downloads", component: DownloadsPanel },
      { id: "modpacks", label: "Modpacks", component: ModpacksPanel },
    ],
  },
  {
    title: "Advanced",
    items: [
      { id: "debugging", label: "Debugging", component: DebuggingPanel },
    ],
  },
]

export function SettingsDialog() {
  const settingsOpen = useAppStore((s) => s.settingsOpen)
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen)
  const settingsActiveSection = useAppStore((s) => s.settingsActiveSection)
  const managedGameIds = useGameManagementStore((s) => s.managedGameIds)
  const [activeSection, setActiveSection] = useState(settingsActiveSection || "other")
  const [searchQuery] = useState("")
  const [addGameOpen, setAddGameOpen] = useState(false)

  // Update active section when settingsActiveSection changes
  useEffect(() => {
    if (settingsActiveSection) {
      setActiveSection(settingsActiveSection)
    }
  }, [settingsActiveSection])

  const handleOpenChange = (open: boolean) => {
    setSettingsOpen(open)
    if (!open) {
      setActiveSection("other")
      // Clear the stored section
      useAppStore.setState({ settingsActiveSection: null })
    }
  }

  // Build dynamic games section
  const managedGames = managedGameIds
    .map((id) => GAMES.find((g) => g.id === id))
    .filter(Boolean)

  const gamesSection = managedGames.length > 0 ? {
    title: "Games",
    items: managedGames.map((game) => ({
      id: `game-${game!.id}`,
      label: game!.name,
      component: GameSettingsPanel,
      gameId: game!.id,
    })),
  } : null

  // Combine all sections
  const allSections = [...staticNavigationSections]
  if (gamesSection) {
    // insert to the last section
    allSections.push(gamesSection)
  }

  // Find active component
  const activeItem = allSections
    .flatMap((section) => section.items)
    .find((item) => item.id === activeSection)
  const ActiveComponent = (activeItem?.component || OtherPanel) as any
  const activeGameId = activeItem && 'gameId' in activeItem ? (activeItem as any).gameId as string : undefined

  return (
    <>
      <AddGameDialog 
        open={addGameOpen} 
        onOpenChange={setAddGameOpen}
      />
      <Dialog open={settingsOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          className="max-w-[1100px] w-[calc(100vw-2rem)] h-[min(720px,calc(100vh-2rem))] max-h-none p-0 overflow-hidden flex"
          onOverlayClick={() => handleOpenChange(false)}
        >
        {/* Left Sidebar */}
        <div className="w-60 shrink-0 border-r border-border bg-muted/30 flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold">Settings</h2>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            {allSections.map((section) => (
              <div key={section.title} className="mb-6">
                <div className="px-6 mb-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>
                <nav className="space-y-1 px-3">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                        activeSection === item.id
                          ? "bg-muted text-foreground font-medium"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                  {section.title === "Games" && (
                    <button
                      onClick={() => setAddGameOpen(true)}
                      className="w-full text-left px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:bg-muted/50 hover:text-foreground flex items-center gap-2"
                    >
                      <PlusIcon className="size-4" />
                      Add Game
                    </button>
                  )}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Close Button */}
          <div className="absolute top-4 right-4">
            <DialogClose
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9 shrink-0"
              aria-label="Close settings"
            >
              <XIcon className="size-4" />
            </DialogClose>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl px-12 py-8">
              {activeGameId ? (
                <ActiveComponent searchQuery={searchQuery} gameId={activeGameId} />
              ) : (
                <ActiveComponent searchQuery={searchQuery} />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
