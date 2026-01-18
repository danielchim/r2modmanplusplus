import { create } from "zustand"

type View = "library" | "settings" | "config"

type AppState = {
  // Navigation
  view: View
  selectedGameId: string
  selectedModId: string | null
  
  // UI state
  searchQuery: string
  sortBy: "name" | "downloads" | "updated"
  
  // Actions
  setView: (view: View) => void
  selectGame: (gameId: string) => void
  selectMod: (modId: string | null) => void
  setSearchQuery: (query: string) => void
  setSortBy: (sortBy: "name" | "downloads" | "updated") => void
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  view: "library",
  selectedGameId: "bonelab",
  selectedModId: null,
  searchQuery: "",
  sortBy: "name",
  
  // Actions
  setView: (view) => set({ view }),
  selectGame: (gameId) => set({ selectedGameId: gameId, selectedModId: null }),
  selectMod: (modId) => set({ selectedModId: modId }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sortBy) => set({ sortBy: sortBy }),
}))
