import { create } from "zustand"
import { persist } from "zustand/middleware"
import { toast } from "sonner"

type ModManagementState = {
  // Map of gameId -> Set of installed mod IDs
  installedModsByGame: Record<string, Set<string>>
  // Map of gameId -> Set of enabled mod IDs
  enabledModsByGame: Record<string, Set<string>>
  // Map of gameId -> Map of modId -> installed version
  installedModVersionsByGame: Record<string, Record<string, string>>
  // Map of gameId -> Map of modId -> unresolved dependency strings
  dependencyWarningsByGame: Record<string, Record<string, string[]>>
  // Set of mod IDs currently being uninstalled
  uninstallingMods: Set<string>
  
  // Actions
  installMod: (gameId: string, modId: string, version: string) => void
  uninstallMod: (gameId: string, modId: string) => Promise<void>
  uninstallAllMods: (gameId: string) => number
  isModInstalled: (gameId: string, modId: string) => boolean
  getInstalledModIds: (gameId: string) => string[]
  getInstalledVersion: (gameId: string, modId: string) => string | undefined
  
  enableMod: (gameId: string, modId: string) => void
  disableMod: (gameId: string, modId: string) => void
  toggleMod: (gameId: string, modId: string) => void
  isModEnabled: (gameId: string, modId: string) => boolean
  
  setDependencyWarnings: (gameId: string, modId: string, warnings: string[]) => void
  clearDependencyWarnings: (gameId: string, modId: string) => void
  getDependencyWarnings: (gameId: string, modId: string) => string[]
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
      
      enabledModsByGame: {
        bonelab: new Set([
          "772e464e-aba3-4c0e-be61-0f3efe588b60", // BoneLib (enabled)
          "f21c391c-0bc5-431d-a233-95323b95e01b", // r2modman (enabled)
        ]),
      },
      
      installedModVersionsByGame: {
        bonelab: {
          "772e464e-aba3-4c0e-be61-0f3efe588b60": "1.0.0", // BoneLib
          "f21c391c-0bc5-431d-a233-95323b95e01b": "1.0.0", // r2modman
        },
      },
      
      dependencyWarningsByGame: {},
      
      uninstallingMods: new Set(),

      installMod: (gameId, modId, version) => {
        const currentInstalled = get().installedModsByGame
        const currentEnabled = get().enabledModsByGame
        const currentVersions = get().installedModVersionsByGame
        const installedSet = currentInstalled[gameId] || new Set()
        const enabledSet = currentEnabled[gameId] || new Set()
        const versionsMap = currentVersions[gameId] || {}
        
        installedSet.add(modId)
        enabledSet.add(modId) // Default to enabled when installed
        versionsMap[modId] = version
        
        set({
          installedModsByGame: {
            ...currentInstalled,
            [gameId]: new Set(installedSet),
          },
          enabledModsByGame: {
            ...currentEnabled,
            [gameId]: new Set(enabledSet),
          },
          installedModVersionsByGame: {
            ...currentVersions,
            [gameId]: { ...versionsMap },
          },
        })
      },

      uninstallMod: async (gameId, modId) => {
        // Add to uninstalling set
        const currentUninstalling = get().uninstallingMods
        currentUninstalling.add(modId)
        set({
          uninstallingMods: new Set(currentUninstalling),
        })
        
        // Simulate uninstall delay (1-2 seconds)
        await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))
        
        // Remove from installed and enabled
        const currentInstalled = get().installedModsByGame
        const currentEnabled = get().enabledModsByGame
        const currentVersions = get().installedModVersionsByGame
        const currentWarnings = get().dependencyWarningsByGame
        const installedSet = currentInstalled[gameId] || new Set()
        const enabledSet = currentEnabled[gameId] || new Set()
        const versionsMap = { ...(currentVersions[gameId] || {}) }
        const warningsMap = { ...(currentWarnings[gameId] || {}) }
        
        installedSet.delete(modId)
        enabledSet.delete(modId)
        delete versionsMap[modId]
        delete warningsMap[modId]
        
        // Remove from uninstalling set
        const updatedUninstalling = get().uninstallingMods
        updatedUninstalling.delete(modId)
        
        set({
          installedModsByGame: {
            ...currentInstalled,
            [gameId]: new Set(installedSet),
          },
          enabledModsByGame: {
            ...currentEnabled,
            [gameId]: new Set(enabledSet),
          },
          installedModVersionsByGame: {
            ...currentVersions,
            [gameId]: versionsMap,
          },
          dependencyWarningsByGame: {
            ...currentWarnings,
            [gameId]: warningsMap,
          },
          uninstallingMods: new Set(updatedUninstalling),
        })
        
        // Show success toast
        toast.success("Uninstalled successfully")
      },

      uninstallAllMods: (gameId) => {
        const currentInstalled = get().installedModsByGame
        const currentEnabled = get().enabledModsByGame
        const currentVersions = get().installedModVersionsByGame
        const currentWarnings = get().dependencyWarningsByGame
        
        // Get count before clearing
        const installedSet = currentInstalled[gameId] || new Set()
        const modCount = installedSet.size
        
        // Clear all mods for this game
        set({
          installedModsByGame: {
            ...currentInstalled,
            [gameId]: new Set(),
          },
          enabledModsByGame: {
            ...currentEnabled,
            [gameId]: new Set(),
          },
          installedModVersionsByGame: {
            ...currentVersions,
            [gameId]: {},
          },
          dependencyWarningsByGame: {
            ...currentWarnings,
            [gameId]: {},
          },
        })
        
        // Show success toast
        if (modCount > 0) {
          toast.success(`Uninstalled ${modCount} mod${modCount === 1 ? '' : 's'} successfully`)
        } else {
          toast.info("No mods to uninstall")
        }
        
        return modCount
      },

      isModInstalled: (gameId, modId) => {
        const gameSet = get().installedModsByGame[gameId]
        return gameSet ? gameSet.has(modId) : false
      },

      getInstalledModIds: (gameId) => {
        const gameSet = get().installedModsByGame[gameId]
        return gameSet ? Array.from(gameSet) : []
      },
      
      getInstalledVersion: (gameId, modId) => {
        const versionsMap = get().installedModVersionsByGame[gameId]
        return versionsMap ? versionsMap[modId] : undefined
      },
      
      enableMod: (gameId, modId) => {
        const current = get().enabledModsByGame
        const gameSet = current[gameId] || new Set()
        gameSet.add(modId)
        set({
          enabledModsByGame: {
            ...current,
            [gameId]: new Set(gameSet),
          },
        })
      },
      
      disableMod: (gameId, modId) => {
        const current = get().enabledModsByGame
        const gameSet = current[gameId] || new Set()
        gameSet.delete(modId)
        set({
          enabledModsByGame: {
            ...current,
            [gameId]: new Set(gameSet),
          },
        })
      },
      
      toggleMod: (gameId, modId) => {
        const isEnabled = get().isModEnabled(gameId, modId)
        if (isEnabled) {
          get().disableMod(gameId, modId)
        } else {
          get().enableMod(gameId, modId)
        }
      },
      
      isModEnabled: (gameId, modId) => {
        const gameSet = get().enabledModsByGame[gameId]
        return gameSet ? gameSet.has(modId) : false
      },
      
      setDependencyWarnings: (gameId, modId, warnings) => {
        const current = get().dependencyWarningsByGame
        const gameWarnings = current[gameId] || {}
        set({
          dependencyWarningsByGame: {
            ...current,
            [gameId]: {
              ...gameWarnings,
              [modId]: warnings,
            },
          },
        })
      },
      
      clearDependencyWarnings: (gameId, modId) => {
        const current = get().dependencyWarningsByGame
        const gameWarnings = { ...(current[gameId] || {}) }
        delete gameWarnings[modId]
        set({
          dependencyWarningsByGame: {
            ...current,
            [gameId]: gameWarnings,
          },
        })
      },
      
      getDependencyWarnings: (gameId, modId) => {
        const gameWarnings = get().dependencyWarningsByGame[gameId]
        return gameWarnings ? gameWarnings[modId] || [] : []
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
        enabledModsByGame: Object.fromEntries(
          Object.entries(state.enabledModsByGame).map(([gameId, modSet]) => [
            gameId,
            Array.from(modSet),
          ])
        ),
        installedModVersionsByGame: state.installedModVersionsByGame,
        dependencyWarningsByGame: state.dependencyWarningsByGame,
      }),
      // Custom deserialization for Set
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        installedModsByGame: Object.fromEntries(
          Object.entries(persistedState.installedModsByGame || {}).map(
            ([gameId, modIds]: [string, any]) => [gameId, new Set(modIds)]
          )
        ),
        enabledModsByGame: Object.fromEntries(
          Object.entries(persistedState.enabledModsByGame || {}).map(
            ([gameId, modIds]: [string, any]) => [gameId, new Set(modIds)]
          )
        ),
        installedModVersionsByGame: persistedState.installedModVersionsByGame || {},
        dependencyWarningsByGame: persistedState.dependencyWarningsByGame || {},
      }),
    }
  )
)
