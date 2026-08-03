"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/use-app-store";
import { AppLayout } from "@/components/shared/app-layout";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const openCommandPalette = useAppStore((state) => state.openCommandPalette);

  useEffect(() => {
    const downHandler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openCommandPalette();
      }
    };

    window.addEventListener("keydown", downHandler);

    return () => window.removeEventListener("keydown", downHandler);
  }, [openCommandPalette]);

  return <AppLayout>{children}</AppLayout>;
}
