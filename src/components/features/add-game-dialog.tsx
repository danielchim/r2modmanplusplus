import { useState } from "react"
import { useTranslation } from "react-i18next"
import { List, ChevronLeft, FolderOpen, Loader2 } from "lucide-react"

import {
  AlertDialog,
  AlertDialogContent,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/app-store"
import {
  useAddGame,
  useTouchGame,
  useSetDefaultGame,
  useEnsureDefaultProfile,
  useCreateProfile,
  useSetActiveProfile,
  useUpdateGameSettings,
} from "@/data"
import { ECOSYSTEM_GAMES, type EcosystemGame } from "@/lib/ecosystem-games"
import { selectFolder } from "@/lib/desktop"
import { CreateProfileDialog } from "./create-profile-dialog"
import { toast } from "sonner"

type AddGameDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  forceOpen?: boolean
}

type Step = "select" | "location"

export function AddGameDialog({ open, onOpenChange, forceOpen = false }: AddGameDialogProps) {
  const { t } = useTranslation()
  const [step, setStep] = useState<Step>("select")
  const [pickedGame, setPickedGame] = useState<EcosystemGame | null>(null)
  const [installFolder, setInstallFolder] = useState("")
  const [query, setQuery] = useState("")
  const [profileChoice, setProfileChoice] = useState<"default" | "create" | "import">("default")
  const [createProfileOpen, setCreateProfileOpen] = useState(false)
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [isAddingGame, setIsAddingGame] = useState(false)

  const addGame = useAddGame()
  const touchGame = useTouchGame()
  const setDefaultGame = useSetDefaultGame()
  const ensureDefaultProfile = useEnsureDefaultProfile()
  const createProfile = useCreateProfile()
  const setActiveProfile = useSetActiveProfile()
  const updateGameSettings = useUpdateGameSettings()
  const selectGame = useAppStore((s) => s.selectGame)

  const filteredGames = ECOSYSTEM_GAMES.filter((game) =>
    game.name.toLowerCase().includes(query.toLowerCase())
  )

  const isValidPath = installFolder.trim().length > 0

  const handleGameClick = (game: EcosystemGame) => {
    setPickedGame(game)
    setStep("location")
  }

  const handleBrowseFolder = async () => {
    const folder = await selectFolder()
    if (folder) {
      setInstallFolder(folder)
    }
  }
  
  const handleCreateProfile = async (profileName: string) => {
    if (!pickedGame) return
    const profile = await createProfile.mutateAsync({ gameId: pickedGame.id, name: profileName })
    setSelectedProfileId(profile.id)
    setProfileChoice("create")
    setCreateProfileOpen(false)
  }

  const handleAddGame = async () => {
    if (!pickedGame) return
    setIsAddingGame(true)

    try {
      const isValidPath = installFolder.trim().length > 0

      // Add to managed games
      await addGame.mutateAsync(pickedGame.id)
      await touchGame.mutateAsync(pickedGame.id)

      // Set as default game (latest added becomes default)
      await setDefaultGame.mutateAsync(pickedGame.id)

      // Only create profiles if install folder is valid (non-empty)
      if (isValidPath) {
        if (installFolder.trim()) {
          await updateGameSettings.mutateAsync({ gameId: pickedGame.id, updates: { gameInstallFolder: installFolder } })
        }

        // Ensure default profile exists
        const defaultProfileId = await ensureDefaultProfile.mutateAsync(pickedGame.id)

        // Set active profile based on user choice
        if (profileChoice === "create" && selectedProfileId) {
          await setActiveProfile.mutateAsync({ gameId: pickedGame.id, profileId: selectedProfileId })
        } else if (profileChoice === "import") {
          toast.info(t("add_game_profile_import_toast"))
          await setActiveProfile.mutateAsync({ gameId: pickedGame.id, profileId: defaultProfileId })
        } else {
          await setActiveProfile.mutateAsync({ gameId: pickedGame.id, profileId: defaultProfileId })
        }
      }
      // If !isValidPath: don't call ensureDefaultProfile or setActiveProfile

      // Select the game
      selectGame(pickedGame.id)

      // Close dialog and reset state
      onOpenChange(false)
      setStep("select")
      setPickedGame(null)
      setInstallFolder("")
      setQuery("")
      setProfileChoice("default")
      setSelectedProfileId(null)
    } finally {
      setIsAddingGame(false)
    }
  }

  const handleBack = () => {
    setStep("select")
    setPickedGame(null)
    setInstallFolder("")
  }
  
  const handleOpenChange = (nextOpen: boolean) => {
    // Prevent closing if forced open (first run)
    if (forceOpen && !nextOpen) {
      return
    }
    onOpenChange(nextOpen)
  }

  return (
    <>
      <CreateProfileDialog
        open={createProfileOpen}
        onOpenChange={setCreateProfileOpen}
        onCreateProfile={handleCreateProfile}
      />
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent 
        className="!max-w-[80vw] !w-[80vw] h-[80vh] p-0 gap-0 overflow-hidden flex flex-col"
        onOverlayClick={() => handleOpenChange(false)}
      >
        {/* Step 1: Game Selection */}
        {step === "select" && (
          <>
            {/* Header */}
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold mb-1">{t("add_game_title_selection")}</h2>
              <p className="text-sm text-muted-foreground">
                {forceOpen
                  ? t("add_game_subtitle_first")
                  : t("add_game_subtitle_which")}
              </p>
            </div>

            {/* Main content */}
            <div className="px-6 py-4 flex-1 flex flex-col overflow-hidden">
              {/* Search bar and list button */}
              <div className="flex gap-3 mb-4">
                <Input
                  type="text"
                  placeholder={t("add_game_search_placeholder")}
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
                      {t("add_game_tab_game")}
                    </TabsTrigger>
                    <TabsTrigger value="server">
                      {t("add_game_tab_server")}
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="game" className="mt-0 flex-1 overflow-hidden">
                  {/* Game Grid */}
                  <div className="h-full overflow-y-auto p-4">
                    {filteredGames.length === 0 ? (
                      <div className="text-muted-foreground py-20 text-center text-sm">
                        {t("add_game_no_games_found")}
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
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="server" className="mt-0 flex-1 overflow-hidden">
                  {/* Server Game Grid - Same as Game tab */}
                  <div className="h-full overflow-y-auto pr-2">
                    <div className="text-muted-foreground rounded-md border border-dashed py-12 text-center text-sm mb-4">
                      {t("add_game_connect_server")}
                    </div>
                      <div className="grid grid-cols-8 gap-8">
                      {ECOSYSTEM_GAMES.map((game) => (
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
                {t("add_game_back_to_selection")}
              </button>
              <h2 className="text-lg font-semibold mb-1">{t("add_game_set_install_location")}</h2>
              <p className="text-sm text-muted-foreground">{t("add_game_where_installed", { gameName: pickedGame.name })}</p>
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
                  </div>
                </div>

                {/* Install folder input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("add_game_install_folder_optional")}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder={t("add_game_install_placeholder")}
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
                      {t("add_game_select_folder")}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("add_game_skip_folder_hint")}
                  </p>
                </div>

                {/* Profile Selection - Always visible, disabled when no path */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("add_game_profile")}</label>
                  <Select 
                    value={profileChoice} 
                    onValueChange={(value) => setProfileChoice(value as typeof profileChoice)}
                    disabled={!isValidPath}
                  >
                    <SelectTrigger disabled={!isValidPath}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">{t("add_game_use_default_profile")}</SelectItem>
                      <SelectItem value="create">{t("add_game_create_new_profile")}</SelectItem>
                      <SelectItem value="import">{t("add_game_import_from_code")}</SelectItem>
                    </SelectContent>
                  </Select>
                  {!isValidPath && (
                    <p className="text-xs text-muted-foreground">
                      {t("add_game_set_install_to_enable_profile")}
                    </p>
                  )}
                  {profileChoice === "create" && isValidPath && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setCreateProfileOpen(true)}
                    >
                      {selectedProfileId ? t("add_game_change_profile_name") : t("add_game_choose_profile_name")}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border px-6 py-4 flex justify-end gap-3">
              <Button variant="ghost" onClick={handleBack}>
                {t("common_cancel")}
              </Button>
              <Button onClick={handleAddGame} disabled={!pickedGame || isAddingGame}>
                {isAddingGame && <Loader2 className="size-4 mr-2 animate-spin" />}
                {t("add_game_add_game_button")}
              </Button>
            </div>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
