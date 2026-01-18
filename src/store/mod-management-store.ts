import { create } from "zustand"
import { persist } from "zustand/middleware"

type ModManagementState = {
  // Map of gameId -> Set of installed mod IDs
  installedModsByGame: Record<string, Set<string>>
  
  // Actions
  installMod: (gameId: string, modId: string) => void
  uninstallMod: (gameId: string, modId: string) => void
  isModInstalled: (gameId: string, modId: string) => boolean
  getInstalledModIds: (gameId: string) => string[]
}

export const useModManagementStore = create<ModManagementState>()(
  persist(
    (set, get) => ({
      // Initial state with some pre-installed BONELAB mods
      installedModsByGame: {
        bonelab: new Set([
          "772e464e-aba3-4c0e-be61-0f3efe588b60", // BoneLib
          "f21c391c-0bc5-431d-a233-95323b95e01b", // r2modman
        ]),
      },

      installMod: (gameId, modId) => {
        const current = get().installedModsByGame
        const gameSet = current[gameId] || new Set()
        gameSet.add(modId)
        set({
          installedModsByGame: {
            ...current,
            [gameId]: new Set(gameSet),
          },
        })
      },

      uninstallMod: (gameId, modId) => {
        const current = get().installedModsByGame
        const gameSet = current[gameId] || new Set()
        gameSet.delete(modId)
        set({
          installedModsByGame: {
            ...current,
            [gameId]: new Set(gameSet),
          },
        })
      },

      isModInstalled: (gameId, modId) => {
        const gameSet = get().installedModsByGame[gameId]
        return gameSet ? gameSet.has(modId) : false
      },

      getInstalledModIds: (gameId) => {
        const gameSet = get().installedModsByGame[gameId]
        return gameSet ? Array.from(gameSet) : []
      },
    }),
    {
      name: "mod-management-storage",
      // Custom serialization for Set
      partialize: (state) => ({
        installedModsByGame: Object.fromEntries(
          Object.entries(state.installedModsByGame).map(([gameId, modSet]) => [
            gameId,
            Array.from(modSet),
          ])
        ),
      }),
      // Custom deserialization for Set
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        installedModsByGame: Object.fromEntries(
          Object.entries(persistedState.installedModsByGame || {}).map(
            ([gameId, modIds]: [string, any]) => [gameId, new Set(modIds)]
          )
        ),
      }),
    }
  )
)
