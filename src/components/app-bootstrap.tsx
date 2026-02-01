import { useEffect, useRef } from "react"
import { useAppStore } from "@/store/app-store"
import { useGameManagementStore } from "@/store/game-management-store"
import { useProfileStore } from "@/store/profile-store"
import { useSettingsStore } from "@/store/settings-store"
import { DownloadBridge } from "@/components/download-bridge"
import { trpc, hasElectronTRPC } from "@/lib/trpc"
import { i18n } from "@/lib/i18n"

export function AppBootstrap() {
  const hasInitialized = useRef(false)
  const defaultGameId = useGameManagementStore((s) => s.defaultGameId)
  const addManagedGame = useGameManagementStore((s) => s.addManagedGame)
  const ensureDefaultProfile = useProfileStore((s) => s.ensureDefaultProfile)
  const selectGame = useAppStore((s) => s.selectGame)
  const getPerGameSettings = useSettingsStore((s) => s.getPerGame)
  const globalSettings = useSettingsStore((s) => s.global)
  const updateGlobal = useSettingsStore((s) => s.updateGlobal)

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
    addManagedGame(defaultGameId)
    
    // Only ensure profile if game has install folder set
    const installFolder = getPerGameSettings(defaultGameId).gameInstallFolder
    if (installFolder?.trim()) {
      ensureDefaultProfile(defaultGameId)
    }
    
    // Select the game
    selectGame(defaultGameId)
  }, [])
  
  return <DownloadBridge />
}
