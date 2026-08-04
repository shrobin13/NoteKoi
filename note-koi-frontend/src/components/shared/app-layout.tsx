"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/use-app-store";
import { useUserStore } from "@/store/use-user-store";
import { CommandPalette } from "@/components/shared/command-palette";
import { BottomNav } from "@/components/shared/bottom-nav";
import { Sidebar } from "@/components/shared/sidebar";
import { TopBar } from "@/components/shared/top-bar";
import { Footer } from "@/components/shared/footer";
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
    "/profile/edit",
  ].includes(pathname || "");

  const sidebarItems = useMemo(
    () => [
      { href: "/", label: "Discover" },
      { href: "/search", label: "Search" },
      { href: "/notifications", label: "Notifications" },
      { href: "/profile", label: "Profile" },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-0 h-screen overflow-y-auto">
            <Sidebar role={role} />
          </div>
        </aside>

        {/* Main content column */}
        <div className="flex min-h-screen flex-col">
          <TopBar onOpenMobileNav={() => setMobileNavOpen(true)} />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
          <Footer />
          {/* Spacer so footer isn't hidden behind mobile bottom nav */}
          <div className="block pb-16 lg:hidden" />
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden">
        <BottomNav role={role} />
      </div>

      {/* FAB */}
      {showUploadFab && role !== "GUEST" ? <FloatingActionButton href="/upload" /> : null}

      {/* Mobile nav dialog */}
      <Dialog open={mobileNavOpen} title="Navigation" onClose={() => setMobileNavOpen(false)}>
        <div className="-mx-6 -mb-6 -mt-2">
          <Sidebar role={role} />
        </div>
      </Dialog>

      {commandPaletteOpen ? <CommandPalette items={sidebarItems} /> : null}
    </div>
  );
}
