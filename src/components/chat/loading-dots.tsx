"use client";

import Image from "next/image";

export function LoadingDots() {
  return (
    <div className="flex items-center gap-3 px-4 py-6">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-petrol-800 text-white">
        <Image
          src="/branding/Kuno-logo-white-solid.svg"
          alt="Kuno"
          width={16}
          height={16}
          className="h-4 w-4"
        />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">Kuno</span>
          <span className="text-xs text-muted-foreground">tenker...</span>
        </div>
        <div className="flex gap-1">
          <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-pulse [animation-delay:0ms]" />
          <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-pulse [animation-delay:150ms]" />
          <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-pulse [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
