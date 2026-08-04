"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Footer } from "@/components/shared/footer";

interface AuthFormLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  /** Show "Sign in →" link. Set to false on the login page itself. */
  showSignIn?: boolean;
}

export function AuthFormLayout({ title, description, children, showSignIn = true }: AuthFormLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--canvas)]">
      {/* Nav bar */}
      <nav className="border-b border-[var(--line-soft)] bg-[var(--paper)] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-12 max-w-5xl items-center justify-between">
          {/* Left: back button + brand */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              aria-label="Back to home"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--line-soft)] bg-[var(--ph)] transition-colors hover:bg-[var(--ph-strong)]"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--ink-soft)]">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
            <span className="text-[15px] font-semibold tracking-tight text-[var(--ink)]">NoteKoi</span>
          </div>

          {/* Right: optional sign-in link + theme toggle */}
          <div className="flex items-center gap-3">
            {showSignIn && (
              <Link href="/login" className="text-[12px] font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">
                Sign in →
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Form content */}
      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-[16px] border border-[var(--line-soft)] bg-[var(--paper)] p-8 space-y-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--ink-soft)]">{description}</p>
              <h1 className="mt-2 text-[26px] font-semibold text-[var(--ink)]">{title}</h1>
            </div>
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer minimal />
    </div>
  );
}
