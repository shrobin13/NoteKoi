"use client";

import Link from "next/link";
import { useUserStore } from "@/store/use-user-store";

interface FooterProps {
  /** Show only brand + copyright — used on auth pages */
  minimal?: boolean;
}

const NAV_LINKS = [
  { href: "/", label: "Discover" },
  { href: "/search", label: "Search" },
  { href: "/my-uploads", label: "My Uploads" },
  { href: "/notifications", label: "Notifications" },
  { href: "/profile", label: "Profile" },
];

const GUEST_LINKS = [
  { href: "/", label: "Discover" },
  { href: "/search", label: "Search" },
  { href: "/login", label: "Sign In" },
  { href: "/register/student", label: "Register" },
];

export function Footer({ minimal = false }: FooterProps) {
  const role = useUserStore((s) => s.role);
  const isAuth = role !== "GUEST";
  const links = isAuth ? NAV_LINKS : GUEST_LINKS;
  const year = new Date().getFullYear();

  if (minimal) {
    return (
      <footer className="border-t border-[var(--line-soft)] bg-[var(--paper)] px-6 py-5">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 text-[11.5px] text-[var(--ink-soft)]">
          <span className="font-semibold text-[var(--ink)]">NoteKoi</span>
          <span>© {year} NoteKoi. Academic resource sharing.</span>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-[var(--line-soft)] bg-[var(--paper)] px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 sm:grid-cols-[1fr_auto]">
          {/* Brand */}
          <div className="space-y-1.5">
            <Link href="/" className="text-[14px] font-bold tracking-tight text-[var(--ink)] hover:opacity-80">
              NoteKoi
            </Link>
            <p className="text-[12px] text-[var(--ink-soft)] leading-relaxed max-w-xs">
              A collaborative academic resource-sharing platform for students and teachers.
            </p>
            <p className="text-[11px] text-[var(--ink-soft)] pt-2">
              © {year} NoteKoi
            </p>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 sm:flex-col sm:gap-y-2.5">
            <p className="w-full text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)] sm:mb-1">
              Navigation
            </p>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[12px] text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
