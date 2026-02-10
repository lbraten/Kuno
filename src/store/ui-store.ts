import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  theme: "light" | "dark" | "system";
  sidebarOpen: boolean;
  insightPanelOpen: boolean;
  commandPaletteOpen: boolean;

  setTheme: (theme: "light" | "dark" | "system") => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleInsightPanel: () => void;
  setInsightPanelOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "system",
      sidebarOpen: true,
      insightPanelOpen: true,
      commandPaletteOpen: false,

      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleInsightPanel: () =>
        set((state) => ({ insightPanelOpen: !state.insightPanelOpen })),
      setInsightPanelOpen: (open) => set({ insightPanelOpen: open }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
    }),
    {
      name: "kuno-ui-storage",
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
