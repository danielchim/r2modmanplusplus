import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Profile = {
  id: string
  name: string
  createdAt: number
}

type ProfileState = {
  // Profiles per game
  profilesByGame: Record<string, Profile[]>
  // Active profile per game
  activeProfileIdByGame: Record<string, string>
  
  // Actions
  ensureDefaultProfile: (gameId: string) => string
  setActiveProfile: (gameId: string, profileId: string) => void
  createProfile: (gameId: string, name: string) => Profile
  renameProfile: (gameId: string, profileId: string, newName: string) => void
  deleteProfile: (gameId: string, profileId: string) => { deleted: boolean; reason?: string }
  resetGameProfilesToDefault: (gameId: string) => string
  removeGameProfiles: (gameId: string) => void
}

function getDefaultProfileId(gameId: string): string {
  return `${gameId}-default`
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      // Initial state - empty (profiles only created when game has valid path)
      profilesByGame: {},
      activeProfileIdByGame: {},
      
      // Actions
      ensureDefaultProfile: (gameId) => {
        const state = get()
        const defaultProfileId = getDefaultProfileId(gameId)
        const profiles = state.profilesByGame[gameId] || []
        const hasActiveProfile = !!state.activeProfileIdByGame[gameId]
        
        // Check if default profile already exists
        const defaultExists = profiles.some(p => p.id === defaultProfileId)
        
        // Only update state if something needs to change
        if (!defaultExists || !hasActiveProfile) {
          set((state) => {
            const updates: Partial<ProfileState> = {}
            
            // Add default profile if it doesn't exist
            if (!defaultExists) {
              const defaultProfile: Profile = {
                id: defaultProfileId,
                name: "Default",
                createdAt: Date.now(),
              }
              
              updates.profilesByGame = {
                ...state.profilesByGame,
                [gameId]: [...(state.profilesByGame[gameId] || []), defaultProfile],
              }
            }
            
            // Set as active if no active profile for this game
            if (!state.activeProfileIdByGame[gameId]) {
              updates.activeProfileIdByGame = {
                ...state.activeProfileIdByGame,
                [gameId]: defaultProfileId,
              }
            }
            
            return updates
          })
        }
        
        return defaultProfileId
      },
      
      setActiveProfile: (gameId, profileId) =>
        set((state) => ({
          activeProfileIdByGame: {
            ...state.activeProfileIdByGame,
            [gameId]: profileId,
          },
        })),
      
      createProfile: (gameId, name) => {
        const newProfile: Profile = {
          id: `${gameId}-${crypto.randomUUID()}`,
          name,
          createdAt: Date.now(),
        }
        
        set((state) => ({
          profilesByGame: {
            ...state.profilesByGame,
            [gameId]: [...(state.profilesByGame[gameId] || []), newProfile],
          },
          activeProfileIdByGame: {
            ...state.activeProfileIdByGame,
            [gameId]: newProfile.id,
          },
        }))
        
        return newProfile
      },
      
      renameProfile: (gameId, profileId, newName) => {
        set((state) => {
          const profiles = state.profilesByGame[gameId] || []
          const updatedProfiles = profiles.map(p =>
            p.id === profileId ? { ...p, name: newName } : p
          )
          
          return {
            profilesByGame: {
              ...state.profilesByGame,
              [gameId]: updatedProfiles,
            },
          }
        })
      },
      
      deleteProfile: (gameId, profileId) => {
        const state = get()
        const defaultProfileId = getDefaultProfileId(gameId)
        
        // Block deletion of default profile
        if (profileId === defaultProfileId) {
          return { deleted: false, reason: "default" }
        }
        
        const profiles = state.profilesByGame[gameId] || []
        const updatedProfiles = profiles.filter(p => p.id !== profileId)
        
        set((state) => ({
          profilesByGame: {
            ...state.profilesByGame,
            [gameId]: updatedProfiles,
          },
        }))
        
        // If we deleted the active profile, switch to default
        if (state.activeProfileIdByGame[gameId] === profileId) {
          // Ensure default exists
          get().ensureDefaultProfile(gameId)
        }
        
        return { deleted: true }
      },
      
      resetGameProfilesToDefault: (gameId) => {
        const defaultProfileId = getDefaultProfileId(gameId)
        const defaultProfile: Profile = {
          id: defaultProfileId,
          name: "Default",
          createdAt: Date.now(),
        }
        
        set((state) => ({
          profilesByGame: {
            ...state.profilesByGame,
            [gameId]: [defaultProfile],
          },
          activeProfileIdByGame: {
            ...state.activeProfileIdByGame,
            [gameId]: defaultProfileId,
          },
        }))
        
        return defaultProfileId
      },
      
      removeGameProfiles: (gameId) => {
        set((state) => {
          const { [gameId]: _removed, ...remainingProfiles } = state.profilesByGame
          const { [gameId]: _removedActive, ...remainingActive } = state.activeProfileIdByGame
          
          return {
            profilesByGame: remainingProfiles,
            activeProfileIdByGame: remainingActive,
          }
        })
      },
    }),
    {
      name: "r2modman.profiles",
    }
  )
)
