import { create } from "zustand";

interface AppState {
  commandPaletteOpen: boolean;
  recentlyVisited: string[];
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;
  addRecentlyVisited: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  commandPaletteOpen: false,
  recentlyVisited: [],
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
  addRecentlyVisited: (id: string) =>
    set((state) => ({
      recentlyVisited: [id, ...state.recentlyVisited.filter((existing) => existing !== id)].slice(0, 5)
    }))
}));
