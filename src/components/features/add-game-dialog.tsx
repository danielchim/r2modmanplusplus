import { useState } from "react"
import { List, ChevronLeft, FolderOpen } from "lucide-react"

import {
  AlertDialog,
  AlertDialogContent,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/app-store"
import { useGameManagementStore } from "@/store/game-management-store"
import { useProfileStore } from "@/store/profile-store"
import { useSettingsStore } from "@/store/settings-store"
import { GAMES, type Game } from "@/mocks/games"
import { selectFolder } from "@/lib/desktop"

type AddGameDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = "select" | "location"

export function AddGameDialog({ open, onOpenChange }: AddGameDialogProps) {
  const [step, setStep] = useState<Step>("select")
  const [pickedGame, setPickedGame] = useState<Game | null>(null)
  const [installFolder, setInstallFolder] = useState("")
  const [query, setQuery] = useState("")

  const addManagedGame = useGameManagementStore((s) => s.addManagedGame)
  const appendRecentManagedGame = useGameManagementStore(
    (s) => s.appendRecentManagedGame
  )
  const setDefaultGameId = useGameManagementStore((s) => s.setDefaultGameId)
  const ensureDefaultProfile = useProfileStore((s) => s.ensureDefaultProfile)
  const selectGame = useAppStore((s) => s.selectGame)
  const updatePerGameSettings = useSettingsStore((s) => s.updatePerGame)

  const filteredGames = GAMES.filter((game) =>
    game.name.toLowerCase().includes(query.toLowerCase())
  )

  const handleGameClick = (game: Game) => {
    setPickedGame(game)
    setStep("location")
  }

  const handleBrowseFolder = async () => {
    const folder = await selectFolder()
    if (folder) {
      setInstallFolder(folder)
    }
  }

  const handleAddGame = () => {
    if (!pickedGame) return

    // Add to managed games
    addManagedGame(pickedGame.id)
    appendRecentManagedGame(pickedGame.id)

    // Set as default game (latest added becomes default)
    setDefaultGameId(pickedGame.id)

    // Ensure default profile exists
    ensureDefaultProfile(pickedGame.id)

    // Save install folder if provided
    if (installFolder.trim()) {
      updatePerGameSettings(pickedGame.id, { gameInstallFolder: installFolder })
    }

    // Select the game
    selectGame(pickedGame.id)

    // Close dialog and reset state
    onOpenChange(false)
    setStep("select")
    setPickedGame(null)
    setInstallFolder("")
    setQuery("")
  }

  const handleBack = () => {
    setStep("select")
    setPickedGame(null)
    setInstallFolder("")
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent 
        className="max-w-[80vw]! w-[80vw]! h-[80vh] p-0 gap-0 overflow-hidden flex flex-col"
        onOverlayClick={() => onOpenChange(false)}
      >
        {/* Step 1: Game Selection */}
        {step === "select" && (
          <>
            {/* Header */}
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold mb-1">Game selection</h2>
              <p className="text-sm text-muted-foreground">Which game are you managing your mods for?</p>
            </div>

            {/* Main content */}
            <div className="px-6 py-4 flex-1 flex flex-col overflow-hidden">
              {/* Search bar and list button */}
              <div className="flex gap-3 mb-4">
                <Input
                  type="text"
                  placeholder="Search for a game"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" size="icon" className="shrink-0">
                  <List className="size-5" />
                </Button>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="game" className="w-full flex-1 flex flex-col overflow-hidden">
                <div className="flex justify-center mb-4">
                  <TabsList variant="line">
                    <TabsTrigger value="game">
                      Game
                    </TabsTrigger>
                    <TabsTrigger value="server">
                      Server
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="game" className="mt-0 flex-1 overflow-hidden">
                  {/* Game Grid */}
                  <div className="h-full overflow-y-auto p-4">
                    {filteredGames.length === 0 ? (
                      <div className="text-muted-foreground py-20 text-center text-sm">
                        No games found
                      </div>
                    ) : (
                      <div className="grid grid-cols-8 gap-8">
                        {filteredGames.map((game) => (
                          <button
                            key={game.id}
                            onClick={() => handleGameClick(game)}
                            className="group relative aspect-3/4 overflow-hidden rounded-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <img
                              src={game.bannerUrl}
                              alt={game.name}
                              className="size-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400'%3E%3Crect width='300' height='400' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23fff' font-family='sans-serif' font-size='28' font-weight='600'%3E" + encodeURIComponent(game.name) + "%3C/text%3E%3C/svg%3E"
                              }}
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="absolute bottom-0 left-0 right-0 p-3">
                                <p className="text-white text-sm font-medium line-clamp-2">
                                  {game.name}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="server" className="mt-0 flex-1 overflow-hidden">
                  {/* Server Game Grid - Same as Game tab */}
                  <div className="h-full overflow-y-auto pr-2">
                    <div className="text-muted-foreground rounded-md border border-dashed py-12 text-center text-sm mb-4">
                      Connect to a server to browse games.
                    </div>
                      <div className="grid grid-cols-8 gap-8">
                      {GAMES.map((game) => (
                        <button
                          key={`server-${game.id}`}
                          onClick={() => handleGameClick(game)}
                          className="group relative aspect-[3/4] overflow-hidden rounded-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <img
                            src={game.bannerUrl}
                            alt={game.name}
                            className="size-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400'%3E%3Crect width='300' height='400' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23fff' font-family='sans-serif' font-size='28' font-weight='600'%3E" + encodeURIComponent(game.name) + "%3C/text%3E%3C/svg%3E"
                              }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <p className="text-white text-sm font-medium line-clamp-2">
                                {game.name}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}

        {/* Step 2: Install Location */}
        {step === "location" && pickedGame && (
          <>
            {/* Header */}
            <div className="border-b border-border px-6 py-4">
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
              >
                <ChevronLeft className="size-4" />
                Back to game selection
              </button>
              <h2 className="text-lg font-semibold mb-1">Set install location</h2>
              <p className="text-sm text-muted-foreground">Where is {pickedGame.name} installed?</p>
            </div>

            {/* Main content */}
            <div className="px-6 py-4 flex-1 flex flex-col">
              <div className="max-w-2xl mx-auto w-full space-y-6 py-8">
                {/* Selected game display */}
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <img
                    src={pickedGame.bannerUrl}
                    alt={pickedGame.name}
                    className="w-16 h-20 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='80'%3E%3Crect width='64' height='80' fill='%23374151'/%3E%3C/svg%3E"
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{pickedGame.name}</h3>
                    <p className="text-sm text-muted-foreground">Profile: Default</p>
                  </div>
                </div>

                {/* Install folder input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Game install folder (optional)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="e.g., C:\Program Files (x86)\Steam\steamapps\common\..."
                      value={installFolder}
                      onChange={(e) => setInstallFolder(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBrowseFolder}
                    >
                      <FolderOpen className="size-4 mr-2" />
                      Browse
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    If you skip this, the Launch buttons will be disabled until you set the folder later.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border px-6 py-4 flex justify-end gap-3">
              <Button variant="ghost" onClick={handleBack}>
                Cancel
              </Button>
              <Button onClick={handleAddGame}>
                Add Game
              </Button>
            </div>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
