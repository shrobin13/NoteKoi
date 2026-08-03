import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "NoteKoi | Auth",
  description: "Authentication pages for NoteKoi."
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-slate-950 text-slate-100">{children}</div>;
}
