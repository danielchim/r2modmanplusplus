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
  removeManagedGame: (gameId: string) => string | null
}

export const useGameManagementStore = create<GameManagementState>()(
  persist(
    (set, get) => ({
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
      
      removeManagedGame: (gameId) => {
        const state = get()
        
        // Remove from managed games
        const updatedManagedGameIds = state.managedGameIds.filter((id) => id !== gameId)
        
        // Remove from recent games
        const updatedRecentGameIds = state.recentManagedGameIds.filter((id) => id !== gameId)
        
        // Determine next default
        let nextDefaultGameId: string | null = null
        if (state.defaultGameId === gameId) {
          // Pick the most recent remaining game, or the last managed game
          const candidatesFromRecent = updatedRecentGameIds.filter((id) => updatedManagedGameIds.includes(id))
          if (candidatesFromRecent.length > 0) {
            nextDefaultGameId = candidatesFromRecent[candidatesFromRecent.length - 1]
          } else if (updatedManagedGameIds.length > 0) {
            nextDefaultGameId = updatedManagedGameIds[updatedManagedGameIds.length - 1]
          }
        } else {
          nextDefaultGameId = state.defaultGameId
        }
        
        set({
          managedGameIds: updatedManagedGameIds,
          recentManagedGameIds: updatedRecentGameIds,
          defaultGameId: nextDefaultGameId,
        })
        
        return nextDefaultGameId
      },
    }),
    {
      name: "r2modman.gameManagement",
    }
  )
)
