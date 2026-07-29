import { AmbientBackground } from "@/components/layout/AmbientBackground";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
      }}
    >
      <AmbientBackground />

      {/* Logo */}
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 40,
          textDecoration: "none",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "var(--default-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.85rem",
            fontWeight: 800,
            color: "#fff",
            fontFamily: "var(--font-display)",
            boxShadow: "0 4px 16px rgba(36,97,59,0.3)",
          }}
        >
          NK
        </div>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "1.1rem",
            color: "var(--text)",
            letterSpacing: "-0.03em",
          }}
        >
          NoteKoi
        </span>
      </Link>

      <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>
        {children}
      </div>

      <p
        style={{
          marginTop: 32,
          fontSize: "0.75rem",
          color: "var(--text-subtle)",
          position: "relative",
          zIndex: 1,
        }}
      >
        © 2026 NoteKoi. Built for students, by students.
      </p>
    </div>
  );
}
