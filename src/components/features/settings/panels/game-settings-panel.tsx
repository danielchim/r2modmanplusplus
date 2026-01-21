import { SettingsRow } from "../settings-row"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useProfileStore } from "@/store/profile-store"
import { useSettingsStore } from "@/store/settings-store"
import { openFolder, selectFolder } from "@/lib/desktop"
import { GAMES } from "@/mocks/games"

interface GameSettingsPanelProps {
  searchQuery: string
  gameId?: string
}

export function GameSettingsPanel({ gameId }: GameSettingsPanelProps) {
  const activeProfileIdByGame = useProfileStore((s) => s.activeProfileIdByGame)
  const { dataFolder } = useSettingsStore((s) => s.global)
  const getPerGame = useSettingsStore((s) => s.getPerGame)
  const updatePerGame = useSettingsStore((s) => s.updatePerGame)

  if (!gameId) {
    return (
      <div>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Game Settings</h2>
          <p className="text-sm text-muted-foreground">
            No game selected
          </p>
        </div>
      </div>
    )
  }

  const game = GAMES.find((g) => g.id === gameId)
  const perGameSettings = getPerGame(gameId)

  if (!game) {
    return (
      <div>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Game Settings</h2>
          <p className="text-sm text-muted-foreground">
            Game not found
          </p>
        </div>
      </div>
    )
  }

  const handleSelectInstallFolder = async () => {
    const newPath = await selectFolder()
    if (newPath) {
      updatePerGame(gameId, { gameInstallFolder: newPath })
    }
  }

  const handleLaunchParametersChange = (value: string) => {
    updatePerGame(gameId, { launchParameters: value })
  }

  const handleBrowseProfileFolder = () => {
    const profileId = activeProfileIdByGame[gameId]
    if (profileId) {
      const profilePath = `${dataFolder}/${gameId}/profiles/${profileId}`
      openFolder(profilePath)
    }
  }

  const handleResetGameInstallation = () => {
    const confirmed = confirm(
      `Are you sure you want to reset the installation for ${game.name}? This will remove all mods and profiles.`
    )
    if (confirmed) {
      console.log(`Resetting game installation for ${gameId}`)
      // TODO: Clear per-game settings, clear profiles, clear installed mods
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">{game.name}</h2>
        <p className="text-sm text-muted-foreground">
          Configure settings for this game
        </p>
      </div>

      <div className="space-y-0 divide-y divide-border">
        <SettingsRow
          title="Game install folder"
          description="Location where the game is installed"
          value={perGameSettings.gameInstallFolder || "Not set"}
          rightContent={
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectInstallFolder}
            >
              Select Folder
            </Button>
          }
        />

        <SettingsRow
          title="Launch parameters"
          description="Additional command-line arguments to pass when launching the game"
          rightContent={
            <Input
              value={perGameSettings.launchParameters || ""}
              onChange={(e) => handleLaunchParametersChange(e.target.value)}
              placeholder="e.g., --debug --windowed"
              className="w-[300px]"
            />
          }
        />

        <SettingsRow
          title="Active profile"
          description="The currently selected profile for this game"
          value={activeProfileIdByGame[gameId] || "None"}
          rightContent={
            <Button
              variant="outline"
              size="sm"
              onClick={handleBrowseProfileFolder}
              disabled={!activeProfileIdByGame[gameId]}
            >
              Browse Profile Folder
            </Button>
          }
        />

        <SettingsRow
          title="Reset game installation"
          description="Remove all mods, profiles, and cached data for this game"
          rightContent={
            <Button
              variant="destructive"
              size="sm"
              onClick={handleResetGameInstallation}
            >
              Reset Installation
            </Button>
          }
        />
      </div>
    </div>
  )
}
