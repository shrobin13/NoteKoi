import type { Metadata } from "next";
import "@/app/globals.css";
import { AppProviders } from "@/components/shared/app-providers";

export const metadata: Metadata = {
  title: "NoteKoi",
  description: "A collaborative resource sharing platform for students and teachers."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen mb-15 bg-[var(--canvas)] text-[var(--ink)]">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
