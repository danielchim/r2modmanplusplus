import { useEffect, useRef } from "react"
import { useAppStore } from "@/store/app-store"
import {
  useGameManagementData,
  useGameManagementActions,
  useProfileActions,
  useSettingsData,
  useSettingsActions,
} from "@/data"
import { DownloadBridge } from "@/components/download-bridge"
import { trpc, hasElectronTRPC } from "@/lib/trpc"
import { i18n } from "@/lib/i18n"

export function AppBootstrap() {
  const hasInitialized = useRef(false)
  const { defaultGameId } = useGameManagementData()
  const gameMut = useGameManagementActions()
  const profileMut = useProfileActions()
  const selectGame = useAppStore((s) => s.selectGame)
  const { global: globalSettings, getPerGame } = useSettingsData()
  const { updateGlobal } = useSettingsActions()

  useEffect(() => {
    void i18n.changeLanguage(globalSettings.language)
  }, [globalSettings.language])

  // Fetch default paths from Electron (only in Electron mode)
  const defaultPathsQuery = trpc.desktop.getDefaultPaths.useQuery(undefined, {
    enabled: hasElectronTRPC(),
    staleTime: Infinity, // These paths don't change during runtime
  })

  // Initialize/migrate settings with Electron defaults
  useEffect(() => {
    if (!hasElectronTRPC() || !defaultPathsQuery.data) return

    const { dataFolder: electronDataFolder, steamFolder: electronSteamFolder } = defaultPathsQuery.data
    const updates: Partial<typeof globalSettings> = {}

    // Migrate dataFolder if unset or still on old placeholder
    if (!globalSettings.dataFolder || globalSettings.dataFolder === "E:\\lmao") {
      updates.dataFolder = electronDataFolder
    }

    // Set steamFolder if unset and we found one
    if (!globalSettings.steamFolder && electronSteamFolder) {
      updates.steamFolder = electronSteamFolder
    }

    // Apply updates if any
    if (Object.keys(updates).length > 0) {
      updateGlobal(updates)
    }
  }, [defaultPathsQuery.data, globalSettings.dataFolder, globalSettings.steamFolder, updateGlobal])

  useEffect(() => {
    if (hasInitialized.current || !defaultGameId) return
    hasInitialized.current = true

    // Ensure game is managed
    gameMut.addManagedGame(defaultGameId)

    // Only ensure profile if game has install folder set
    const installFolder = getPerGame(defaultGameId).gameInstallFolder
    if (installFolder?.trim()) {
      profileMut.ensureDefaultProfile(defaultGameId)
    }

    // Select the game
    selectGame(defaultGameId)
  }, [])

  return <DownloadBridge />
}
