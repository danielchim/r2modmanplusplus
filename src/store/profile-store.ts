import { create } from "zustand"
import { persist } from "zustand/middleware"

type ProfileState = {
  // Active profile per game
  activeProfileIdByGame: Record<string, string>
  
  // Actions
  setActiveProfile: (gameId: string, profileId: string) => void
  ensureDefaultProfile: (gameId: string) => string
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      // Initial state - default profiles for each game
      activeProfileIdByGame: {
        "ror2": "ror2-default",
        "valheim": "valheim-default",
        "lethal-company": "lc-default",
        "dyson-sphere": "dsp-default",
      },
      
      // Actions
      setActiveProfile: (gameId, profileId) =>
        set((state) => ({
          activeProfileIdByGame: {
            ...state.activeProfileIdByGame,
            [gameId]: profileId,
          },
        })),
      
      ensureDefaultProfile: (gameId) => {
        const state = get()
        const existingProfileId = state.activeProfileIdByGame[gameId]
        
        if (existingProfileId) {
          return existingProfileId
        }
        
        const defaultProfileId = `${gameId}-default`
        set((state) => ({
          activeProfileIdByGame: {
            ...state.activeProfileIdByGame,
            [gameId]: defaultProfileId,
          },
        }))
        
        return defaultProfileId
      },
    }),
    {
      name: "r2modman.profiles",
    }
  )
)
