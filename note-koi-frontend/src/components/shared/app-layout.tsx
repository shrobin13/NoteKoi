"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/use-app-store";
import { useUserStore } from "@/store/use-user-store";
import { CommandPalette } from "@/components/shared/command-palette";
import { BottomNav } from "@/components/shared/bottom-nav";
import { Sidebar } from "@/components/shared/sidebar";
import { TopBar } from "@/components/shared/top-bar";
import { FloatingActionButton } from "@/components/shared/floating-action-button";
import { Dialog } from "@/components/ui/dialog";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const commandPaletteOpen = useAppStore((state) => state.commandPaletteOpen);
  const role = useUserStore((state) => state.role);
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const showUploadFab = ![
    "/upload",
    "/my-uploads",
    "/verification-pending",
    "/profile/edit"
  ].includes(pathname || "");

  const sidebarItems = useMemo(
    () => [
      { href: "/", label: "Discover" },
      { href: "/search", label: "Search" },
      { href: "/notifications", label: "Notifications" },
      { href: "/profile", label: "Profile" }
    ],
    []
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden border-r border-slate-800/70 bg-slate-950/95 lg:block">
          <Sidebar role={role} />
        </aside>
        <div className="flex min-h-screen flex-col">
          <TopBar onOpenMobileNav={() => setMobileNavOpen(true)} />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
          <footer className="block lg:hidden">
            <BottomNav role={role} />
          </footer>
          {showUploadFab && role !== "GUEST" ? <FloatingActionButton href="/upload" /> : null}
        </div>
      </div>

      <Dialog open={mobileNavOpen} title="Navigation" onClose={() => setMobileNavOpen(false)}>
        <Sidebar role={role} />
      </Dialog>

      {commandPaletteOpen ? <CommandPalette items={sidebarItems} /> : null}
    </div>
  );
}
