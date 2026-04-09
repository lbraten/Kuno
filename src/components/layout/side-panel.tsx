"use client";

import { ReactNode, useEffect } from "react";
import { useUIStore } from "@/store/ui-store";
import { useChatStore } from "@/store/chat-store";
import { cn } from "@/lib/utils";
import { X, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidePanelProps {
  children: ReactNode;
}

export function SidePanel({ children }: SidePanelProps) {
  const { sidebarOpen, setSidebarOpen, setCommandPaletteOpen } = useUIStore();
  const createConversation = useChatStore((state) => state.createConversation);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setSidebarOpen]);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 border-r bg-background overflow-hidden transition-[width,transform] duration-300 ease-in-out md:static md:inset-auto md:translate-x-0",
          sidebarOpen ? "w-72 translate-x-0" : "w-72 -translate-x-full md:w-16 md:translate-x-0"
        )}
      >
        <div className="relative h-full">
          <div
            className={cn(
              "flex h-full flex-col transition-opacity duration-200",
              sidebarOpen ? "opacity-100" : "opacity-100 md:opacity-0 md:pointer-events-none"
            )}
          >
            <div className="flex items-center justify-between p-4 md:hidden border-b">
              <h2 className="font-semibold">Meny</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                aria-label="Lukk sidebar"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
              {children}
            </div>
          </div>

          <div
            className={cn(
              "absolute inset-0 hidden md:flex md:flex-col md:items-center md:gap-3 md:py-3 transition-opacity duration-200",
              sidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              className="[&_svg]:size-5"
              onClick={createConversation}
              aria-label="Ny chat"
            >
              <Plus />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="[&_svg]:size-5"
              onClick={() => setCommandPaletteOpen(true)}
              aria-label="Søk"
            >
              <Search />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="[&_svg]:size-5"
              onClick={() => setSidebarOpen(true)}
              aria-label="Åpne sidepanel"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12" />
                <path d="M9 4v16" />
                <path d="M14 10l2 2l-2 2" />
              </svg>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
