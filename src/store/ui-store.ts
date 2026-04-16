import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  theme: "light" | "dark" | "system";
  sidebarOpen: boolean;
  insightPanelOpen: boolean;
  commandPaletteOpen: boolean;
  settingsOpen: boolean;
  selectedCitationKey: string | null;
  accessibility: {
    infoBanner: boolean;
    markdownMode: boolean;
    showInlineCitationNumbers: boolean;
    textScale: "normal" | "large" | "xlarge";
    developerMode: boolean;
    highContrast: boolean;
    reducedMotion: boolean;
    dyslexicFont: boolean;
    robotoFont: boolean;
    extraLineSpacing: boolean;
    strongFocus: boolean;
  };

  setTheme: (theme: "light" | "dark" | "system") => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleInsightPanel: () => void;
  setInsightPanelOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setAccessibility: (settings: Partial<UIState["accessibility"]>) => void;
  setSelectedCitationKey: (key: string | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "light",
      sidebarOpen: true,
      insightPanelOpen: true,
      commandPaletteOpen: false,
      settingsOpen: false,
      selectedCitationKey: null,
      accessibility: {
        infoBanner: false,
        markdownMode: false,
        showInlineCitationNumbers: true,
        textScale: "normal",
        developerMode: false,
        highContrast: false,
        reducedMotion: false,
        dyslexicFont: false,
        robotoFont: false,
        extraLineSpacing: false,
        strongFocus: false,
      },

      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleInsightPanel: () =>
        set((state) => ({ insightPanelOpen: !state.insightPanelOpen })),
      setInsightPanelOpen: (open) => set({ insightPanelOpen: open }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setSettingsOpen: (open) => set({ settingsOpen: open }),
      setAccessibility: (settings) =>
        set((state) => ({
          accessibility: { ...state.accessibility, ...settings },
        })),
      setSelectedCitationKey: (key) => set({ selectedCitationKey: key }),
    }),
    {
      name: "kuno-ui-storage",
      partialize: (state) => ({
        theme: state.theme,
        accessibility: state.accessibility,
      }),
    }
  )
);
