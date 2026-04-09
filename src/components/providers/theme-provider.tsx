"use client";

import { useEffect } from "react";
import { useUIStore } from "@/store/ui-store";

const THEME_TRANSITION_MS = 180;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useUIStore();

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    const prefersReducedMotion = window
      .matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    const shouldAnimateThemeChange =
      !prefersReducedMotion && !body.classList.contains("a11y-reduced-motion");

    let timeoutId: number | undefined;

    if (shouldAnimateThemeChange) {
      root.classList.add("theme-changing");
    }

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    if (shouldAnimateThemeChange) {
      timeoutId = window.setTimeout(() => {
        root.classList.remove("theme-changing");
      }, THEME_TRANSITION_MS);
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      root.classList.remove("theme-changing");
    };
  }, [theme]);

  return <>{children}</>;
}
