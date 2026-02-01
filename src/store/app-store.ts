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
  sortKey: "updated" | "name" | "downloads"
  sortDir: "asc" | "desc"
  showContextPanel: boolean
  settingsOpen: boolean
  settingsActiveSection: string | null
  
  // Actions
  setView: (view: View) => void
  selectGame: (gameId: string | null) => void
  selectMod: (modId: string | null) => void
  setModLibraryTab: (tab: "installed" | "online") => void
  setSearchQuery: (query: string) => void
  setSortKey: (sortKey: "updated" | "name" | "downloads") => void
  setSortDir: (sortDir: "asc" | "desc") => void
  setSort: (sort: { key: "updated" | "name" | "downloads"; dir: "asc" | "desc" }) => void
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
  sortKey: "updated",
  sortDir: "desc",
  showContextPanel: true,
  settingsOpen: false,
  settingsActiveSection: null,
  
  // Actions
  setView: (view) => set({ view }),
  selectGame: (gameId) => set({ selectedGameId: gameId, selectedModId: null }),
  selectMod: (modId) => set({ selectedModId: modId, showContextPanel: modId !== null }),
  setModLibraryTab: (tab) => set({ modLibraryTab: tab }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortKey: (sortKey) => set({ sortKey }),
  setSortDir: (sortDir) => set({ sortDir }),
  setSort: (sort) => set({ sortKey: sort.key, sortDir: sort.dir }),
  setShowContextPanel: (show) => set({ showContextPanel: show }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  openSettingsToGame: (gameId) => set({ settingsOpen: true, settingsActiveSection: `game-${gameId}` }),
}))
