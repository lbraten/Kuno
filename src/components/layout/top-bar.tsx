"use client";

import { Menu, Settings, Moon, Sun, Monitor } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/ui-store";
import { useChatStore } from "@/store/chat-store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

export function TopBar() {
  const createConversation = useChatStore((state) => state.createConversation);
  const {
    theme,
    setTheme,
    toggleSidebar,
    setSettingsOpen,
  } =
    useUIStore();
  const [mounted, setMounted] = useState(false);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (theme !== "system") {
      setResolvedTheme(theme);
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const updateTheme = () => {
      setResolvedTheme(media.matches ? "dark" : "light");
    };

    updateTheme();

    if (media.addEventListener) {
      media.addEventListener("change", updateTheme);
      return () => media.removeEventListener("change", updateTheme);
    }

    media.addListener(updateTheme);
    return () => media.removeListener(updateTheme);
  }, [theme]);

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const getThemeIcon = () => {
    if (!mounted) return <Monitor className="h-5 w-5" />;
    if (theme === "light") return <Sun className="h-5 w-5" />;
    if (theme === "dark") return <Moon className="h-5 w-5" />;
    return <Monitor className="h-5 w-5" />;
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="flex h-14 items-center px-4 gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="md:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <button
          type="button"
          onClick={createConversation}
          className="-ml-1 flex items-center gap-2 rounded-md px-1 py-1 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Ny chat"
        >
          <Image
            src={
              resolvedTheme === "dark"
                ? "/branding/Kuno-logo-white.svg"
                : "/branding/Kuno-logo.svg"
            }
            alt="Kuno logo"
            width={24}
            height={24}
            className="h-6 w-6"
          />
          <span className="text-xl font-semibold">Kuno</span>
        </button>

        <div className="flex-1" />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={cycleTheme}
                aria-label="Bytt tema"
              >
                {getThemeIcon()}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Tema: {theme === "system" ? "System" : theme === "light" ? "Lys" : "Mørk"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Innstillinger"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Innstillinger</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
}
