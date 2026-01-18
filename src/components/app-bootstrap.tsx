import { useEffect, useRef } from "react"
import { useAppStore } from "@/store/app-store"
import { useGameManagementStore } from "@/store/game-management-store"
import { useProfileStore } from "@/store/profile-store"

export function AppBootstrap() {
  const hasInitialized = useRef(false)
  const defaultGameId = useGameManagementStore((s) => s.defaultGameId)
  const addManagedGame = useGameManagementStore((s) => s.addManagedGame)
  const ensureDefaultProfile = useProfileStore((s) => s.ensureDefaultProfile)
  const selectGame = useAppStore((s) => s.selectGame)

  useEffect(() => {
    if (hasInitialized.current || !defaultGameId) return
    hasInitialized.current = true
    
    // Ensure game is managed
    addManagedGame(defaultGameId)
    // Ensure default profile exists
    ensureDefaultProfile(defaultGameId)
    // Select the game
    selectGame(defaultGameId)
  }, [])
  
  return null
}
