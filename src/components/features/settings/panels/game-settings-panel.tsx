import { SettingsRow } from "../settings-row"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FolderPathControl } from "../folder-path-control"
import { useProfileStore } from "@/store/profile-store"
import { useSettingsStore } from "@/store/settings-store"
import { useModManagementStore } from "@/store/mod-management-store"
import { useGameManagementStore } from "@/store/game-management-store"
import { useAppStore } from "@/store/app-store"
import { openFolder } from "@/lib/desktop"
import { ECOSYSTEM_GAMES } from "@/lib/ecosystem-games"
import { toast } from "sonner"
import { trpc } from "@/lib/trpc"

interface GameSettingsPanelProps {
  searchQuery: string
  gameId?: string
}

export function GameSettingsPanel({ gameId }: GameSettingsPanelProps) {
  const activeProfileIdByGame = useProfileStore((s) => s.activeProfileIdByGame)
  const profilesByGame = useProfileStore((s) => s.profilesByGame)
  const resetGameProfilesToDefault = useProfileStore((s) => s.resetGameProfilesToDefault)
  const removeGameProfiles = useProfileStore((s) => s.removeGameProfiles)
  
  const resetProfileMutation = trpc.profiles.resetProfile.useMutation()
  const unmanageGameMutation = trpc.games.unmanageGameCleanup.useMutation()
  
  const { dataFolder } = useSettingsStore((s) => s.global)
  const getPerGame = useSettingsStore((s) => s.getPerGame)
  const updatePerGame = useSettingsStore((s) => s.updatePerGame)
  const deletePerGame = useSettingsStore((s) => s.deletePerGame)
  
  const deleteProfileState = useModManagementStore((s) => s.deleteProfileState)
  
  const removeManagedGame = useGameManagementStore((s) => s.removeManagedGame)
  
  const selectGame = useAppStore((s) => s.selectGame)
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen)

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

  const game = ECOSYSTEM_GAMES.find((g) => g.id === gameId)
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

  const handleResetGameInstallation = async () => {
    const confirmed = confirm(
      `Are you sure you want to reset the installation for ${game.name}?\n\nThis will:\n- Remove all installed mods (files deleted from disk)\n- Reset profiles to Default only\n- Keep the game install folder and launch parameters`
    )
    if (confirmed) {
      try {
        // Get all profiles for this game
        const profiles = profilesByGame[gameId] || []
        
        let totalFilesRemoved = 0
        
        // Delete BepInEx folder for each profile
        for (const profile of profiles) {
          const result = await resetProfileMutation.mutateAsync({
            gameId,
            profileId: profile.id,
          })
          totalFilesRemoved += result.filesRemoved
          deleteProfileState(profile.id)
        }
        
        // Reset profiles to Default only
        resetGameProfilesToDefault(gameId)
        
        toast.success(`${game.name} installation reset`, {
          description: `${totalFilesRemoved} files removed, reset to Default profile`,
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error"
        toast.error("Failed to reset installation", {
          description: message,
        })
      }
    }
  }

  const handleRemoveManagement = async () => {
    const confirmed = confirm(
      `Are you sure you want to stop managing ${game.name}?\n\nThis will:\n- Remove the game from your managed list\n- Delete all profiles and mods (files removed from disk)\n- Delete all downloads and caches\n- Clear all game settings\n\nYou can add it back later if needed.`
    )
    if (confirmed) {
      try {
        // Delete all game files (profiles + downloads + caches)
        const result = await unmanageGameMutation.mutateAsync({
          gameId,
        })
        
        // Get all profiles for this game
        const profiles = profilesByGame[gameId] || []
        
        // Clear state for each profile
        profiles.forEach((profile) => {
          deleteProfileState(profile.id)
        })
        
        // Remove all game data from stores
        removeGameProfiles(gameId)
        deletePerGame(gameId)
        const nextDefaultGameId = removeManagedGame(gameId)
        
        // Update selected game
        selectGame(nextDefaultGameId)
        
        // Close settings if no games remain
        if (!nextDefaultGameId) {
          setSettingsOpen(false)
        }
        
        toast.success(`${game.name} removed`, {
          description: `${result.totalRemoved} files cleaned up from disk`,
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error"
        toast.error("Failed to remove game", {
          description: message,
        })
      }
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
          belowContent={
            <FolderPathControl
              value={perGameSettings.gameInstallFolder}
              placeholder="Not set"
              onChangePath={(nextPath) => updatePerGame(gameId, { gameInstallFolder: nextPath })}
              className="w-full"
            />
          }
        />

        <SettingsRow
          title="Mod download location"
          description="Where downloaded mod archives are stored for this game. A game-specific subfolder will be created automatically. Leave blank to use global/app behavior."
          belowContent={
            <FolderPathControl
              value={perGameSettings.modDownloadFolder}
              placeholder="Not set (uses global/app behavior)"
              onChangePath={(nextPath) => updatePerGame(gameId, { modDownloadFolder: nextPath })}
              className="w-full"
            />
          }
        />

        <SettingsRow
          title="Mod cache location"
          description="Where cached mod files (extracted/processed mods) are stored for this game. Leave blank to use global/app behavior."
          belowContent={
            <FolderPathControl
              value={perGameSettings.modCacheFolder}
              placeholder="Not set (uses global/app behavior)"
              onChangePath={(nextPath) => updatePerGame(gameId, { modCacheFolder: nextPath })}
              className="w-full"
            />
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
      </div>

      {/* Danger Zone */}
      <div className="mt-8">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Irreversible actions that affect this game
          </p>
        </div>

        <div className="space-y-0 divide-y divide-border border rounded-lg px-6">
          <SettingsRow
            title="Reset installation"
            description="Remove all mods and reset to Default profile only. Keeps game install folder."
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

          <SettingsRow
            title="Remove management"
            description="Stop managing this game entirely. Removes all profiles, mods, and settings."
            rightContent={
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveManagement}
              >
                Remove Management
              </Button>
            }
          />
        </div>
      </div>
    </div>
  )
}
