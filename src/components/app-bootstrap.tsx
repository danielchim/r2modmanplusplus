import { useEffect, useRef } from "react"
import { useAppStore } from "@/store/app-store"
import { useGameManagementStore } from "@/store/game-management-store"
import { useProfileStore } from "@/store/profile-store"
import { useSettingsStore } from "@/store/settings-store"

export function AppBootstrap() {
  const hasInitialized = useRef(false)
  const defaultGameId = useGameManagementStore((s) => s.defaultGameId)
  const addManagedGame = useGameManagementStore((s) => s.addManagedGame)
  const ensureDefaultProfile = useProfileStore((s) => s.ensureDefaultProfile)
  const selectGame = useAppStore((s) => s.selectGame)
  const getPerGameSettings = useSettingsStore((s) => s.getPerGame)

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
  
  return null
}
