"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { login } from "@/lib/auth";
import { useAuthStore } from "@/store/auth";
import type { Metadata } from "next";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setAuth } = useAuthStore();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user, tokens } = await login({ email, password });
      setAuth(user, tokens.accessToken, tokens.refreshToken);
      router.push("/dashboard");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
    >
      <div
        style={{
          background: "var(--surface-elevated)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-strong)",
          boxShadow: "var(--shadow-lg), var(--shadow-glow)",
          padding: "40px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Top gradient accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "linear-gradient(90deg, var(--primary) 0%, var(--secondary) 50%, var(--accent) 100%)",
          }}
        />

        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              fontFamily: "var(--font-display)",
              color: "var(--text)",
              letterSpacing: "-0.03em",
              marginBottom: 8,
            }}
          >
            Welcome back
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
            Sign in to access your academic resources
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Input
            label="Email Address"
            type="email"
            id="login-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@college.edu"
            autoComplete="email"
            required
            leftIcon={<Mail size={15} />}
          />

          <div>
            <Input
              label="Password"
              type={showPw ? "text" : "password"}
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              leftIcon={<Lock size={15} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  style={{ cursor: "pointer", lineHeight: 0 }}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                fontSize: "0.83rem",
                color: "#dc2626",
                background: "rgba(239,68,68,0.06)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "var(--radius-sm)",
                padding: "10px 14px",
                fontWeight: 500,
              }}
            >
              {error}
            </motion.p>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            iconRight={<ArrowRight size={16} />}
            id="login-submit"
          >
            Sign In
          </Button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: 28,
            fontSize: "0.83rem",
            color: "var(--text-muted)",
          }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            style={{
              color: "var(--default-color)",
              fontWeight: 700,
              textDecoration: "none",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.textDecoration = "underline")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.textDecoration = "none")}
          >
            Create one
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
