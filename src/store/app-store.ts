import { create } from "zustand"

type View = "library" | "settings" | "config"

type AppState = {
  // Navigation
  view: View
  selectedGameId: string | null
  selectedModId: string | null
  modLibraryTab: "installed" | "online"
  
  // UI state
  searchQuery: string
  sortBy: "name" | "downloads" | "updated"
  showContextPanel: boolean
  settingsOpen: boolean
  settingsActiveSection: string | null
  
  // Actions
  setView: (view: View) => void
  selectGame: (gameId: string | null) => void
  selectMod: (modId: string | null) => void
  setModLibraryTab: (tab: "installed" | "online") => void
  setSearchQuery: (query: string) => void
  setSortBy: (sortBy: "name" | "downloads" | "updated") => void
  setShowContextPanel: (show: boolean) => void
  setSettingsOpen: (open: boolean) => void
  openSettingsToGame: (gameId: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  view: "library",
  selectedGameId: null,
  selectedModId: null,
  modLibraryTab: "installed",
  searchQuery: "",
  sortBy: "name",
  showContextPanel: true,
  settingsOpen: false,
  settingsActiveSection: null,
  
  // Actions
  setView: (view) => set({ view }),
  selectGame: (gameId) => set({ selectedGameId: gameId, selectedModId: null }),
  selectMod: (modId) => set({ selectedModId: modId, showContextPanel: modId !== null }),
  setModLibraryTab: (tab) => set({ modLibraryTab: tab }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sortBy) => set({ sortBy: sortBy }),
  setShowContextPanel: (show) => set({ showContextPanel: show }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  openSettingsToGame: (gameId) => set({ settingsOpen: true, settingsActiveSection: `game-${gameId}` }),
}))
