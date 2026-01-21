import { create } from "zustand"
import { persist } from "zustand/middleware"

type GameManagementState = {
  // All games the user has added to manage
  managedGameIds: string[]
  
  // Recently selected games (for quick access)
  recentManagedGameIds: string[]
  
  // Default game to load on app start
  defaultGameId: string | null
  
  // Actions
  addManagedGame: (gameId: string) => void
  appendRecentManagedGame: (gameId: string) => void
  setDefaultGameId: (gameId: string | null) => void
}

export const useGameManagementStore = create<GameManagementState>()(
  persist(
    (set) => ({
      // Initial state
      managedGameIds: [],
      recentManagedGameIds: [],
      defaultGameId: null,
      
      // Actions
      addManagedGame: (gameId) =>
        set((state) => {
          if (state.managedGameIds.includes(gameId)) {
            return state
          }
          return {
            managedGameIds: [...state.managedGameIds, gameId],
          }
        }),
      
      appendRecentManagedGame: (gameId) =>
        set((state) => {
          // Remove existing occurrence
          const filtered = state.recentManagedGameIds.filter((id) => id !== gameId)
          // Append to end
          const updated = [...filtered, gameId]
          // Cap to 10
          const capped = updated.slice(-10)
          return {
            recentManagedGameIds: capped,
          }
        }),
      
      setDefaultGameId: (gameId) =>
        set({
          defaultGameId: gameId,
        }),
    }),
    {
      name: "r2modman.gameManagement",
    }
  )
)
