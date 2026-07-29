"use client";
import { create } from "zustand";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface UIState {
  commandPaletteOpen: boolean;
  sidebarOpen: boolean;
  breadcrumbs: BreadcrumbItem[];

  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setBreadcrumbs: (items: BreadcrumbItem[]) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  commandPaletteOpen: false,
  sidebarOpen: true,
  breadcrumbs: [],

  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
}));
