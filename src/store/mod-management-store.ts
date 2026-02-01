import { create } from "zustand"
import { persist } from "zustand/middleware"
import { toast } from "sonner"

type ModManagementState = {
  // Map of profileId -> Set of installed mod IDs
  installedModsByProfile: Record<string, Set<string>>
  // Map of profileId -> Set of enabled mod IDs
  enabledModsByProfile: Record<string, Set<string>>
  // Map of profileId -> Map of modId -> installed version
  installedModVersionsByProfile: Record<string, Record<string, string>>
  // Map of profileId -> Map of modId -> unresolved dependency strings
  dependencyWarningsByProfile: Record<string, Record<string, string[]>>
  // Set of mod IDs currently being uninstalled
  uninstallingMods: Set<string>
  
  // Actions
  installMod: (profileId: string, modId: string, version: string) => void
  uninstallMod: (profileId: string, modId: string) => Promise<void>
  uninstallAllMods: (profileId: string) => number
  isModInstalled: (profileId: string, modId: string) => boolean
  getInstalledModIds: (profileId: string) => string[]
  getInstalledVersion: (profileId: string, modId: string) => string | undefined
  
  enableMod: (profileId: string, modId: string) => void
  disableMod: (profileId: string, modId: string) => void
  toggleMod: (profileId: string, modId: string) => void
  isModEnabled: (profileId: string, modId: string) => boolean
  
  setDependencyWarnings: (profileId: string, modId: string, warnings: string[]) => void
  clearDependencyWarnings: (profileId: string, modId: string) => void
  getDependencyWarnings: (profileId: string, modId: string) => string[]
  
  deleteProfileState: (profileId: string) => void
}

export const useModManagementStore = create<ModManagementState>()(
  persist(
    (set, get) => ({
      // Initial state - empty (no seeded mods)
      installedModsByProfile: {},
      enabledModsByProfile: {},
      installedModVersionsByProfile: {},
      dependencyWarningsByProfile: {},
      uninstallingMods: new Set(),

      installMod: (profileId, modId, version) => {
        const currentInstalled = get().installedModsByProfile
        const currentEnabled = get().enabledModsByProfile
        const currentVersions = get().installedModVersionsByProfile
        const installedSet = currentInstalled[profileId] || new Set()
        const enabledSet = currentEnabled[profileId] || new Set()
        const versionsMap = currentVersions[profileId] || {}
        
        installedSet.add(modId)
        enabledSet.add(modId) // Default to enabled when installed
        versionsMap[modId] = version
        
        set({
          installedModsByProfile: {
            ...currentInstalled,
            [profileId]: new Set(installedSet),
          },
          enabledModsByProfile: {
            ...currentEnabled,
            [profileId]: new Set(enabledSet),
          },
          installedModVersionsByProfile: {
            ...currentVersions,
            [profileId]: { ...versionsMap },
          },
        })
      },

      uninstallMod: async (profileId, modId) => {
        // Add to uninstalling set
        const currentUninstalling = get().uninstallingMods
        currentUninstalling.add(modId)
        set({
          uninstallingMods: new Set(currentUninstalling),
        })
        
        // Simulate uninstall delay (1-2 seconds)
        await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))
        
        // Remove from installed and enabled
        const currentInstalled = get().installedModsByProfile
        const currentEnabled = get().enabledModsByProfile
        const currentVersions = get().installedModVersionsByProfile
        const currentWarnings = get().dependencyWarningsByProfile
        const installedSet = currentInstalled[profileId] || new Set()
        const enabledSet = currentEnabled[profileId] || new Set()
        const versionsMap = { ...(currentVersions[profileId] || {}) }
        const warningsMap = { ...(currentWarnings[profileId] || {}) }
        
        installedSet.delete(modId)
        enabledSet.delete(modId)
        delete versionsMap[modId]
        delete warningsMap[modId]
        
        // Remove from uninstalling set
        const updatedUninstalling = get().uninstallingMods
        updatedUninstalling.delete(modId)
        
        set({
          installedModsByProfile: {
            ...currentInstalled,
            [profileId]: new Set(installedSet),
          },
          enabledModsByProfile: {
            ...currentEnabled,
            [profileId]: new Set(enabledSet),
          },
          installedModVersionsByProfile: {
            ...currentVersions,
            [profileId]: versionsMap,
          },
          dependencyWarningsByProfile: {
            ...currentWarnings,
            [profileId]: warningsMap,
          },
          uninstallingMods: new Set(updatedUninstalling),
        })
        
        // Show success toast
        toast.success("Uninstalled successfully")
      },

      uninstallAllMods: (profileId) => {
        const currentInstalled = get().installedModsByProfile
        const currentEnabled = get().enabledModsByProfile
        const currentVersions = get().installedModVersionsByProfile
        const currentWarnings = get().dependencyWarningsByProfile
        
        // Get count before clearing
        const installedSet = currentInstalled[profileId] || new Set()
        const modCount = installedSet.size
        
        // Clear all mods for this profile
        set({
          installedModsByProfile: {
            ...currentInstalled,
            [profileId]: new Set(),
          },
          enabledModsByProfile: {
            ...currentEnabled,
            [profileId]: new Set(),
          },
          installedModVersionsByProfile: {
            ...currentVersions,
            [profileId]: {},
          },
          dependencyWarningsByProfile: {
            ...currentWarnings,
            [profileId]: {},
          },
        })
        
        return modCount
      },

      isModInstalled: (profileId, modId) => {
        const profileSet = get().installedModsByProfile[profileId]
        return profileSet ? profileSet.has(modId) : false
      },

      getInstalledModIds: (profileId) => {
        const profileSet = get().installedModsByProfile[profileId]
        return profileSet ? Array.from(profileSet) : []
      },
      
      getInstalledVersion: (profileId, modId) => {
        const versionsMap = get().installedModVersionsByProfile[profileId]
        return versionsMap ? versionsMap[modId] : undefined
      },
      
      enableMod: (profileId, modId) => {
        const current = get().enabledModsByProfile
        const profileSet = current[profileId] || new Set()
        profileSet.add(modId)
        set({
          enabledModsByProfile: {
            ...current,
            [profileId]: new Set(profileSet),
          },
        })
      },
      
      disableMod: (profileId, modId) => {
        const current = get().enabledModsByProfile
        const profileSet = current[profileId] || new Set()
        profileSet.delete(modId)
        set({
          enabledModsByProfile: {
            ...current,
            [profileId]: new Set(profileSet),
          },
        })
      },
      
      toggleMod: (profileId, modId) => {
        const isEnabled = get().isModEnabled(profileId, modId)
        if (isEnabled) {
          get().disableMod(profileId, modId)
        } else {
          get().enableMod(profileId, modId)
        }
      },
      
      isModEnabled: (profileId, modId) => {
        const profileSet = get().enabledModsByProfile[profileId]
        return profileSet ? profileSet.has(modId) : false
      },
      
      setDependencyWarnings: (profileId, modId, warnings) => {
        const current = get().dependencyWarningsByProfile
        const profileWarnings = current[profileId] || {}
        set({
          dependencyWarningsByProfile: {
            ...current,
            [profileId]: {
              ...profileWarnings,
              [modId]: warnings,
            },
          },
        })
      },
      
      clearDependencyWarnings: (profileId, modId) => {
        const current = get().dependencyWarningsByProfile
        const profileWarnings = { ...(current[profileId] || {}) }
        delete profileWarnings[modId]
        set({
          dependencyWarningsByProfile: {
            ...current,
            [profileId]: profileWarnings,
          },
        })
      },
      
      getDependencyWarnings: (profileId, modId) => {
        const profileWarnings = get().dependencyWarningsByProfile[profileId]
        return profileWarnings ? profileWarnings[modId] || [] : []
      },
      
      deleteProfileState: (profileId) => {
        const currentInstalled = get().installedModsByProfile
        const currentEnabled = get().enabledModsByProfile
        const currentVersions = get().installedModVersionsByProfile
        const currentWarnings = get().dependencyWarningsByProfile
        
        // Delete all state for this profile
        const newInstalled = { ...currentInstalled }
        const newEnabled = { ...currentEnabled }
        const newVersions = { ...currentVersions }
        const newWarnings = { ...currentWarnings }
        
        delete newInstalled[profileId]
        delete newEnabled[profileId]
        delete newVersions[profileId]
        delete newWarnings[profileId]
        
        set({
          installedModsByProfile: newInstalled,
          enabledModsByProfile: newEnabled,
          installedModVersionsByProfile: newVersions,
          dependencyWarningsByProfile: newWarnings,
        })
      },
    }),
    {
      name: "mod-management-storage.v2",
      // Custom serialization for Set
      partialize: (state) => ({
        installedModsByProfile: Object.fromEntries(
          Object.entries(state.installedModsByProfile).map(([profileId, modSet]) => [
            profileId,
            Array.from(modSet),
          ])
        ),
        enabledModsByProfile: Object.fromEntries(
          Object.entries(state.enabledModsByProfile).map(([profileId, modSet]) => [
            profileId,
            Array.from(modSet),
          ])
        ),
        installedModVersionsByProfile: state.installedModVersionsByProfile,
        dependencyWarningsByProfile: state.dependencyWarningsByProfile,
      }),
      // Custom deserialization for Set
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        installedModsByProfile: Object.fromEntries(
          Object.entries(persistedState.installedModsByProfile || {}).map(
            ([profileId, modIds]: [string, any]) => [profileId, new Set(modIds)]
          )
        ),
        enabledModsByProfile: Object.fromEntries(
          Object.entries(persistedState.enabledModsByProfile || {}).map(
            ([profileId, modIds]: [string, any]) => [profileId, new Set(modIds)]
          )
        ),
        installedModVersionsByProfile: persistedState.installedModVersionsByProfile || {},
        dependencyWarningsByProfile: persistedState.dependencyWarningsByProfile || {},
      }),
    }
  )
)
