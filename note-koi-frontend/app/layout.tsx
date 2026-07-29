import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { CommandPalette } from "@/components/ui/CommandPalette";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NoteKoi — Academic Knowledge Platform",
    template: "%s | NoteKoi",
  },
  description:
    "NoteKoi is an ultra-premium academic resource and collaboration platform. Browse notes, lectures, PYQs, and connect with classmates — organized by college, department, semester, and course.",
  keywords: ["academic resources", "college notes", "study materials", "student platform", "NoteKoi"],
  openGraph: {
    title: "NoteKoi — Academic Knowledge Platform",
    description: "Your college's living knowledge universe.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <QueryProvider>
          {children}
          <CommandPalette />
        </QueryProvider>
      </body>
    </html>
  );
}
