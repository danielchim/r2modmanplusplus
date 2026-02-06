import { useTranslation } from "react-i18next"
import { SettingsRow } from "../settings-row"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FolderPathControl } from "../folder-path-control"
import {
  useSettingsData,
  useSettingsActions,
  useProfileData,
  useProfileActions,
  useModManagementActions,
  useGameManagementActions,
} from "@/data"
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
  const { t } = useTranslation()
  const { profilesByGame, activeProfileIdByGame } = useProfileData()
  const profileMut = useProfileActions()

  const resetProfileMutation = trpc.profiles.resetProfile.useMutation()
  const unmanageGameMutation = trpc.games.unmanageGameCleanup.useMutation()
  const cleanupInjectedMutation = trpc.launch.cleanupInjected.useMutation()

  const { global: globalSettings, getPerGame } = useSettingsData()
  const settingsMut = useSettingsActions()

  const modMut = useModManagementActions()
  const gameMut = useGameManagementActions()

  const selectGame = useAppStore((s) => s.selectGame)
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen)

  if (!gameId) {
    return (
      <div>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">{t("settings_game_settings")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("common_no_game_selected")}
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
          <h2 className="text-2xl font-semibold mb-2">{t("settings_game_settings")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("common_game_not_found")}
          </p>
        </div>
      </div>
    )
  }

  const handleLaunchParametersChange = (value: string) => {
    settingsMut.updatePerGame(gameId, { launchParameters: value })
  }

  const handleBrowseProfileFolder = () => {
    const profileId = activeProfileIdByGame[gameId]
    if (profileId) {
      const profilePath = `${globalSettings.dataFolder}/${gameId}/profiles/${profileId}`
      openFolder(profilePath)
    }
  }

  const handleResetGameInstallation = async () => {
    const confirmed = confirm(
      `Are you sure you want to reset the installation for ${game.name}?\n\nThis will:\n- Remove all installed mods (files deleted from disk)\n- Reset profiles to Default only\n- Keep the game install folder and launch parameters`
    )
    if (confirmed) {
      try {
        const profiles = profilesByGame[gameId] || []

        let totalFilesRemoved = 0

        for (const profile of profiles) {
          const result = await resetProfileMutation.mutateAsync({
            gameId,
            profileId: profile.id,
          })
          totalFilesRemoved += result.filesRemoved
          await modMut.deleteProfileState(profile.id)
        }

        await profileMut.resetGameProfilesToDefault(gameId)

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
      `Are you sure you want to stop managing ${game.name}?\n\nThis will:\n- Attempt to remove injected BepInEx/Doorstop files from the game install folder and restore backups\n- Files modified after injection will be left untouched\n- Remove the game from your managed list\n- Delete all profiles and mods (files removed from disk)\n- Delete all downloads and caches\n- Clear all game settings\n\nThe game must be closed before proceeding.\n\nYou can add it back later if needed.`
    )
    if (confirmed) {
      try {
        const cleanupResult = await cleanupInjectedMutation.mutateAsync({
          gameId,
        })

        const result = await unmanageGameMutation.mutateAsync({
          gameId,
        })

        const profiles = profilesByGame[gameId] || []

        for (const profile of profiles) {
          await modMut.deleteProfileState(profile.id)
        }

        await profileMut.removeGameProfiles(gameId)
        await settingsMut.deletePerGame(gameId)
        const nextDefaultGameId = await gameMut.removeManagedGame(gameId)

        selectGame(nextDefaultGameId)

        if (!nextDefaultGameId) {
          setSettingsOpen(false)
        }

        toast.success(`${game.name} removed`, {
          description: `Cleaned up ${cleanupResult.restored + cleanupResult.removed} injected files, ${result.totalRemoved} total files removed`,
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error"
        toast.error("Failed to remove game", {
          description: message,
        })
      }
    }
  }

  const handleCleanupInjected = async () => {
    const confirmed = confirm(
      `Clean up injected files from ${game.name}?\n\nThis will:\n- Remove BepInEx/Doorstop files from the game install folder\n- Restore backed-up original files\n- Skip files that were modified after injection\n\nThe game must be closed before proceeding.`
    )
    if (confirmed) {
      try {
        const result = await cleanupInjectedMutation.mutateAsync({
          gameId,
        })

        toast.success("Injected files cleaned up", {
          description: `Restored ${result.restored} files, removed ${result.removed} files, skipped ${result.skipped} modified files`,
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error"
        toast.error("Failed to cleanup injected files", {
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
          title={t("settings_game_install_folder_title")}
          description={t("settings_game_install_folder_description")}
          belowContent={
            <FolderPathControl
              value={perGameSettings.gameInstallFolder}
              placeholder={t("settings_game_install_folder_placeholder")}
              onChangePath={(nextPath) => settingsMut.updatePerGame(gameId, { gameInstallFolder: nextPath })}
              className="w-full"
            />
          }
        />

        <SettingsRow
          title={t("settings_game_mod_download_title")}
          description={t("settings_game_mod_download_description")}
          belowContent={
            <FolderPathControl
              value={perGameSettings.modDownloadFolder}
              placeholder={t("settings_game_placeholder_global")}
              onChangePath={(nextPath) => settingsMut.updatePerGame(gameId, { modDownloadFolder: nextPath })}
              className="w-full"
            />
          }
        />

        <SettingsRow
          title={t("settings_game_mod_cache_title")}
          description={t("settings_game_mod_cache_description")}
          belowContent={
            <FolderPathControl
              value={perGameSettings.modCacheFolder}
              placeholder={t("settings_game_placeholder_global")}
              onChangePath={(nextPath) => settingsMut.updatePerGame(gameId, { modCacheFolder: nextPath })}
              className="w-full"
            />
          }
        />

        <SettingsRow
          title={t("settings_game_launch_params_title")}
          description={t("settings_game_launch_params_description")}
          rightContent={
            <Input
              value={perGameSettings.launchParameters || ""}
              onChange={(e) => handleLaunchParametersChange(e.target.value)}
              placeholder={t("settings_game_launch_params_placeholder")}
              className="w-[300px]"
            />
          }
        />

        <SettingsRow
          title={t("settings_game_active_profile_title")}
          description={t("settings_game_active_profile_description")}
          value={activeProfileIdByGame[gameId] || t("settings_game_active_profile_none")}
          rightContent={
            <Button
              variant="outline"
              size="sm"
              onClick={handleBrowseProfileFolder}
              disabled={!activeProfileIdByGame[gameId]}
            >
              {t("settings_game_browse_profile_folder")}
            </Button>
          }
        />
      </div>

      {/* Danger Zone */}
      <div className="mt-8">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-destructive">{t("settings_danger_zone")}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t("settings_game_danger_description")}
          </p>
        </div>

        <div className="space-y-0 divide-y divide-border border rounded-lg px-6">
          <SettingsRow
            title={t("settings_game_clean_injected_title")}
            description={t("settings_game_clean_injected_description")}
            rightContent={
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCleanupInjected}
              >
                {t("settings_game_clean_injected_button")}
              </Button>
            }
          />

          <SettingsRow
            title={t("settings_game_reset_title")}
            description={t("settings_game_reset_description")}
            rightContent={
              <Button
                variant="destructive"
                size="sm"
                onClick={handleResetGameInstallation}
              >
                {t("settings_game_reset_button")}
              </Button>
            }
          />

          <SettingsRow
            title={t("settings_game_remove_title")}
            description={t("settings_game_remove_description")}
            rightContent={
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveManagement}
              >
                {t("settings_game_remove_button")}
              </Button>
            }
          />
        </div>
      </div>
    </div>
  )
}
