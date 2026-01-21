import { create } from "zustand"
import { persist } from "zustand/middleware"

type GlobalSettings = {
  // Locations
  dataFolder: string
  steamFolder: string
  
  // Downloads
  speedLimitEnabled: boolean
  speedLimitBps: number // Internal: bytes per second
  speedUnit: "Bps" | "bps" // Display unit preference
  maxConcurrentDownloads: number
  downloadCacheEnabled: boolean
  preferredThunderstoreCdn: string
  
  // Mods
  enforceDependencyVersions: boolean
  
  // UI / Other
  cardDisplayType: "collapsed" | "expanded"
  theme: "dark" | "light" | "system"
  funkyMode: boolean
}

type PerGameSettings = {
  gameInstallFolder: string
  launchParameters: string
  onlineModListCacheDate: number | null
}

type SettingsState = {
  global: GlobalSettings
  perGame: Record<string, PerGameSettings>
  
  // Actions
  updateGlobal: (updates: Partial<GlobalSettings>) => void
  updatePerGame: (gameId: string, updates: Partial<PerGameSettings>) => void
  getPerGame: (gameId: string) => PerGameSettings
  resetPerGame: (gameId: string) => void
  deletePerGame: (gameId: string) => void
}

const defaultGlobalSettings: GlobalSettings = {
  dataFolder: "E:\\lmao",
  steamFolder: "C:\\Program Files (x86)\\Steam",
  speedLimitEnabled: false,
  speedLimitBps: 0,
  speedUnit: "Bps",
  maxConcurrentDownloads: 3,
  downloadCacheEnabled: true,
  preferredThunderstoreCdn: "main",
  enforceDependencyVersions: true,
  cardDisplayType: "collapsed",
  theme: "dark",
  funkyMode: false,
}

const defaultPerGameSettings: PerGameSettings = {
  gameInstallFolder: "",
  launchParameters: "",
  onlineModListCacheDate: null,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      global: defaultGlobalSettings,
      perGame: {},
      
      updateGlobal: (updates) =>
        set((state) => ({
          global: { ...state.global, ...updates },
        })),
      
      updatePerGame: (gameId, updates) =>
        set((state) => ({
          perGame: {
            ...state.perGame,
            [gameId]: {
              ...defaultPerGameSettings,
              ...state.perGame[gameId],
              ...updates,
            },
          },
        })),
      
      getPerGame: (gameId) => {
        const state = get()
        return {
          ...defaultPerGameSettings,
          ...state.perGame[gameId],
        }
      },
      
      resetPerGame: (gameId) =>
        set((state) => ({
          perGame: {
            ...state.perGame,
            [gameId]: { ...defaultPerGameSettings },
          },
        })),
      
      deletePerGame: (gameId) =>
        set((state) => {
          const { [gameId]: _removed, ...remaining } = state.perGame
          return {
            perGame: remaining,
          }
        }),
    }),
    {
      name: "r2modman.settings",
    }
  )
)
