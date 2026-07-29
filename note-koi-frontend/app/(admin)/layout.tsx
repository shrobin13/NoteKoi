"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageTransition } from "@/components/layout/PageTransition";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { useAuthStore } from "@/store/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user && user.role === "STUDENT") {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role === "STUDENT") return null;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      <AmbientBackground />
      <Navbar />
      <div style={{ display: "flex", flex: 1, position: "relative", zIndex: 1 }}>
        <Sidebar />
        <main
          style={{
            flex: 1,
            minWidth: 0,
            overflow: "auto",
            padding: "32px 32px",
          }}
        >
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
