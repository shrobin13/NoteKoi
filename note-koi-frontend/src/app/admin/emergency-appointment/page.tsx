"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createEmergencyAppointment } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/utils";

type EmergencyRole = "SUB_ADMIN" | "CR" | "CO_CR";

const ROLE_OPTIONS: { value: EmergencyRole; label: string }[] = [
  { value: "SUB_ADMIN", label: "Sub Admin" },
  { value: "CR", label: "CR" },
  { value: "CO_CR", label: "Co-CR" },
];

/**
 * Emergency Appointment — Milestone 7 task 3 / wireframe B.25
 * Requires Justification Note (textarea, min length 20) per Milestone 7 §Validation.
 * POST /platform-admin/emergency-appointments (wirefram-resolution.md §4 B.25).
 */
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
    <section className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Administration</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Emergency Appointment</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Appoint an interim Sub Admin, CR, or Co-CR immediately. A justification note is required.
        </p>
      </div>

      {success && (
        <div className="mb-6 rounded-2xl border border-green-700/60 bg-green-900/20 px-4 py-3 text-sm text-green-300">
          Emergency appointment created successfully.
        </div>
      )}

      <Card className="border-slate-700/80 bg-slate-900/80 p-6">
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2 text-sm">
              <span className="font-medium text-slate-200">User ID *</span>
              <input
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="User ID to appoint"
              />
            </label>
            <label className="block space-y-2 text-sm">
              <span className="font-medium text-slate-200">Role *</span>
              <select
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500"
                value={role}
                onChange={(e) => setRole(e.target.value as EmergencyRole)}
              >
                {ROLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block space-y-2 text-sm">
              <span className="font-medium text-slate-200">College ID</span>
              <input
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500"
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value)}
                placeholder="Optional"
              />
            </label>
            <label className="block space-y-2 text-sm">
              <span className="font-medium text-slate-200">Department ID</span>
              <input
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                placeholder="For CR/Co-CR"
              />
            </label>
            <label className="block space-y-2 text-sm">
              <span className="font-medium text-slate-200">Session ID</span>
              <input
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="For CR/Co-CR"
              />
            </label>
          </div>

          <label className="block space-y-2 text-sm">
            <span className="font-medium text-slate-200">
              Justification Note *{" "}
              <span className={`font-normal ${justification.length < 20 ? "text-rose-400" : "text-green-400"}`}>
                ({justification.length}/20 min)
              </span>
            </span>
            <textarea
              className="min-h-[120px] w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Explain the emergency and why this appointment is needed (minimum 20 characters)…"
            />
          </label>

          {mutation.error && (
            <p className="rounded-2xl border border-rose-500 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {getErrorMessage(mutation.error, "Emergency appointment failed.")}
            </p>
          )}

          <div className="flex justify-end">
            <Button type="button" disabled={!canSubmit} onClick={() => mutation.mutate()}>
              {mutation.isPending ? "Submitting…" : "Submit Emergency Appointment"}
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}
