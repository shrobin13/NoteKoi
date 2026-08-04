"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createEmergencyAppointment } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/utils";

type EmergencyRole = "SUB_ADMIN" | "CR" | "CO_CR";

const ROLE_OPTIONS: { value: EmergencyRole; label: string }[] = [
  { value: "SUB_ADMIN", label: "Sub Admin" },
  { value: "CR", label: "CR" },
  { value: "CO_CR", label: "Co-CR" },
];

const inputCls =
  "w-full rounded-[8px] border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-[12px] text-[var(--ink)] outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]";

export default function EmergencyAppointmentPage() {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<EmergencyRole>("SUB_ADMIN");
  const [collegeId, setCollegeId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [justification, setJustification] = useState("");
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      createEmergencyAppointment({
        userId,
        role,
        collegeId: collegeId || undefined,
        departmentId: departmentId || undefined,
        sessionId: sessionId || undefined,
        justification,
      }),
    onSuccess: () => {
      setSuccess(true);
      setUserId("");
      setCollegeId("");
      setDepartmentId("");
      setSessionId("");
      setJustification("");
    },
  });

  const canSubmit = userId.trim() && justification.trim().length >= 20 && !mutation.isPending;

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--ink-soft)]">Administration</p>
        <h1 className="mt-1 text-[22px] font-semibold text-[var(--ink)]">Emergency Appointment</h1>
        <p className="mt-1 text-[12.5px] text-[var(--ink-soft)]">
          Appoint an interim Sub Admin, CR, or Co-CR immediately. A justification note is required.
        </p>
      </div>

      {success && (
        <div className="rounded-[8px] border border-[#2f9e52]/40 bg-[#e3f4e8] px-4 py-2.5 text-[12px] text-[#2f9e52]">
          Emergency appointment created successfully.
        </div>
      )}

      <div className="rounded-[16px] border border-[var(--line-soft)] bg-[var(--paper)] p-6 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5 text-[12px]">
            <span className="font-medium text-[var(--ink)]">User ID *</span>
            <input className={inputCls} value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID to appoint" />
          </label>
          <label className="block space-y-1.5 text-[12px]">
            <span className="font-medium text-[var(--ink)]">Role *</span>
            <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value as EmergencyRole)}>
              {ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block space-y-1.5 text-[12px]">
            <span className="font-medium text-[var(--ink)]">College ID</span>
            <input className={inputCls} value={collegeId} onChange={(e) => setCollegeId(e.target.value)} placeholder="Optional" />
          </label>
          <label className="block space-y-1.5 text-[12px]">
            <span className="font-medium text-[var(--ink)]">Department ID</span>
            <input className={inputCls} value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} placeholder="For CR/Co-CR" />
          </label>
          <label className="block space-y-1.5 text-[12px]">
            <span className="font-medium text-[var(--ink)]">Session ID</span>
            <input className={inputCls} value={sessionId} onChange={(e) => setSessionId(e.target.value)} placeholder="For CR/Co-CR" />
          </label>
        </div>

        <label className="block space-y-1.5 text-[12px]">
          <span className="font-medium text-[var(--ink)]">
            Justification Note *{" "}
            <span className={`font-normal ${justification.length < 20 ? "text-[#d24545]" : "text-[#2f9e52]"}`}>
              ({justification.length}/20 min)
            </span>
          </span>
          <textarea
            className={`${inputCls} min-h-[120px]`}
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Explain the emergency and why this appointment is needed (minimum 20 characters)…"
          />
        </label>

        {mutation.error && (
          <p className="rounded-[8px] bg-[#fbe6e6] px-3 py-2 text-[12px] text-[#d24545]">
            {getErrorMessage(mutation.error, "Emergency appointment failed.")}
          </p>
        )}

        <div className="flex justify-end">
          <Button type="button" disabled={!canSubmit} onClick={() => mutation.mutate()}>
            {mutation.isPending ? "Submitting…" : "Submit Emergency Appointment"}
          </Button>
        </div>
      </div>
    </section>
  );
}
