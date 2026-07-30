"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { register } from "@/lib/auth";
import { getColleges, getClassroomUnits } from "@/lib/hierarchy";
import { useAuthStore } from "@/store/auth";

const STEPS = ["Account", "Placement", "Password"];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [collegeId, setCollegeId] = useState("");
  const [classroomUnitId, setClassroomUnitId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const { data: collegesData } = useQuery({
    queryKey: ["colleges"],
    queryFn: () => getColleges(1, 100),
  });

  const { data: units } = useQuery({
    queryKey: ["classroom-units"],
    queryFn: () => getClassroomUnits(),
    enabled: step === 1,
  });

  async function handleSubmit() {
    setError("");
    if (password !== confirmPw) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      const { user, tokens } = await register({ name, email, password, collegeId, classroomUnitId });
      setAuth(user, tokens.accessToken, tokens.refreshToken);
      router.push("/dashboard");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const canNext = step === 0
    ? name.trim().length >= 2 && isValidEmail(email.trim())
    : step === 1
    ? collegeId && classroomUnitId
    : password.length >= 8 && password === confirmPw;

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
  };
  const [dir, setDir] = useState(1);

  function goNext() { setDir(1); setStep((s) => s + 1); }
  function goPrev() { setDir(-1); setStep((s) => s - 1); }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}>
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
        {/* Gradient accent */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: "linear-gradient(90deg, var(--primary) 0%, var(--secondary) 50%, var(--accent) 100%)",
        }} />

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontSize: "1.75rem", fontWeight: 800, fontFamily: "var(--font-display)",
            color: "var(--text)", letterSpacing: "-0.03em", marginBottom: 8,
          }}>
            Join NoteKoi
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
            {STEPS[step] === "Account" && "Start with your basic details"}
            {STEPS[step] === "Placement" && "Select your college and classroom"}
            {STEPS[step] === "Password" && "Secure your account"}
          </p>
        </div>

        {/* Step indicators */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{
                height: 3,
                borderRadius: 99,
                background: i <= step ? "var(--default-color)" : "var(--border)",
                transition: "background 0.3s",
              }} />
              <span style={{
                fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: i <= step ? "var(--default-color)" : "var(--text-subtle)",
                transition: "color 0.3s",
              }}>
                {i < step ? <Check size={12} style={{ display: "inline" }} /> : `${i + 1}. `}{s}
              </span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            {step === 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <label className="input-label" htmlFor="reg-name">Full Name</label>
                  <input
                    id="reg-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="input-field"
                    style={{ width: "100%" }}
                    required
                  />
                </div>
                <div>
                  <label className="input-label" htmlFor="reg-email">Email Address</label>
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@college.edu"
                    className="input-field"
                    style={{ width: "100%" }}
                    required
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <label className="input-label">Select College</label>
                  <select
                    value={collegeId}
                    onChange={(e) => { setCollegeId(e.target.value); setClassroomUnitId(""); }}
                    className="input-field"
                    id="reg-college"
                    style={{ width: "100%", cursor: "pointer" }}
                  >
                    <option value="">Choose your college...</option>
                    {collegesData?.data?.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label">Select Classroom Unit</label>
                  <select
                    value={classroomUnitId}
                    onChange={(e) => setClassroomUnitId(e.target.value)}
                    className="input-field"
                    id="reg-unit"
                    style={{ width: "100%", cursor: "pointer" }}
                    disabled={!collegeId}
                  >
                    <option value="">Choose your class...</option>
                    {units?.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.department?.name ?? u.departmentId} — {u.session?.name ?? u.sessionId}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <Input
                  label="Password"
                  id="reg-password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  leftIcon={<Lock size={15} />}
                  hint="Must be at least 8 characters"
                  rightIcon={
                    <button type="button" onClick={() => setShowPw((p) => !p)} style={{ cursor: "pointer", lineHeight: 0 }}>
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                />
                <Input
                  label="Confirm Password"
                  id="reg-confirm-password"
                  type={showPw ? "text" : "password"}
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="Repeat your password"
                  leftIcon={<Lock size={15} />}
                  error={confirmPw && password !== confirmPw ? "Passwords do not match" : undefined}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 16,
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

        {/* Navigation */}
        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          {step > 0 && (
            <Button variant="secondary" onClick={goPrev} icon={<ArrowLeft size={16} />} id="reg-prev">
              Back
            </Button>
          )}
          {step < 2 ? (
            <Button
              variant="primary"
              onClick={goNext}
              fullWidth
              disabled={!canNext}
              iconRight={<ArrowRight size={16} />}
              id="reg-next"
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              fullWidth
              loading={loading}
              disabled={!canNext}
              iconRight={<ArrowRight size={16} />}
              id="reg-submit"
            >
              Create Account
            </Button>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: "0.83rem", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--default-color)", fontWeight: 700 }}>
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
