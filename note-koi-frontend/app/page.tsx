"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen, Layers, ShieldCheck, Sparkles, Compass, CheckCircle2, ChevronRight } from "lucide-react";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { Button } from "@/components/ui/Button";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 28 } },
};

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <AmbientBackground />

      {/* Top Bar */}
      <header className="glass-strong" style={{ position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid var(--border)", padding: "0 32px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--default-color)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 800, color: "#fff", fontFamily: "var(--font-display)", boxShadow: "0 4px 16px rgba(36,97,59,0.3)" }}>
            NK
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.15rem", color: "var(--text)", letterSpacing: "-0.03em" }}>
            NoteKoi
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/explore" className="btn btn-ghost btn-sm">Explore Library</Link>
          <Link href="/login" className="btn btn-secondary btn-sm">Sign In</Link>
          <Link href="/register" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="section-pad" style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        <div className="container-narrow">
          <motion.div variants={container} initial="hidden" animate="show">
            {/* Pill Tag */}
            <motion.div variants={item} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: "var(--radius-full)", background: "rgba(143,191,159,0.2)", border: "1px solid var(--border-strong)", marginBottom: 24 }}>
              <Sparkles size={14} style={{ color: "var(--default-color)" }} />
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--default-color)", letterSpacing: "0.02em" }}>
                A Living Knowledge Universe
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 variants={item} style={{ fontFamily: "var(--font-display)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 24 }}>
              Academic Collaboration <br />
              <span className="gradient-text">Reimagined with Elegance.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p variants={item} style={{ fontSize: "1.15rem", color: "var(--text-muted)", maxWidth: 580, margin: "0 auto 36px", lineHeight: 1.6 }}>
              Organizing notes, lectures, and PYQs across Colleges, Departments, Semesters, and Courses — driven by Class Representatives.
            </motion.p>

            {/* CTA Group */}
            <motion.div variants={item} style={{ display: "flex", gap: 14, justifyContent: "center", alignItems: "center" }}>
              <Link href="/register">
                <Button size="lg" variant="primary" iconRight={<ArrowRight size={18} />}>
                  Enter Universe
                </Button>
              </Link>
              <Link href="/explore">
                <Button size="lg" variant="secondary" icon={<Compass size={18} />}>
                  Browse Public Library
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Spatial Hierarchy Feature Section */}
      <section className="section-pad" style={{ position: "relative", zIndex: 1, borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
              Seamless Academic Navigation
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
              Travel deeper into structured knowledge with spatial transitions.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {[
              { level: "College", desc: "Select your university or faculty scope" },
              { level: "Department", desc: "Computer Science, Electrical, Mechanical" },
              { level: "Semester", desc: "Term-wise curriculum & session tracking" },
              { level: "Course & Resources", desc: "Lectures, PYQs, Tutorials & Notes" },
            ].map((step, i) => (
              <motion.div key={step.level} whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 350 }}>
                <div style={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: 28, height: "100%", position: "relative" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--default-color)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Level 0{i + 1}
                  </span>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 800, marginTop: 8, marginBottom: 8 }}>
                    {step.level}
                  </h3>
                  <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "40px 32px", textAlign: "center", color: "var(--text-subtle)", fontSize: "0.85rem" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <span style={{ fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text)" }}>NoteKoi</span>
          <span>© 2026 NoteKoi. Living Knowledge Universe.</span>
        </div>
      </footer>
    </div>
  );
}
