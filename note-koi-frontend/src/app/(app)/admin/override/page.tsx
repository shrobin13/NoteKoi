"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { crudOverride } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/utils";

type OverrideAction = "APPROVE" | "REJECT" | "DELETE" | "RESTORE";

const ACTION_OPTIONS: { value: OverrideAction; label: string }[] = [
  { value: "APPROVE", label: "Force Approve" },
  { value: "REJECT", label: "Force Reject" },
  { value: "DELETE", label: "Force Delete" },
  { value: "RESTORE", label: "Restore" },
];

const inputCls =
  "w-full rounded-[8px] border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-[12px] text-[var(--ink)] outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]";

export default function AdminOverridePage() {
  const [resourceId, setResourceId] = useState("");
  const [action, setAction] = useState<OverrideAction>("APPROVE");
  const [justification, setJustification] = useState("");
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: () => crudOverride(resourceId.trim(), { action, justification }),
    onSuccess: () => {
      setSuccess(true);
      setResourceId("");
      setJustification("");
    },
  });

  const canSubmit = resourceId.trim() && justification.trim().length >= 20 && !mutation.isPending;

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--ink-soft)]">Administration</p>
        <h1 className="mt-1 text-[22px] font-semibold text-[var(--ink)]">CRUD Override</h1>
        <p className="mt-1 text-[12.5px] text-[var(--ink-soft)]">
          Force a state change on any resource, bypassing the normal moderation queue. Requires justification.
        </p>
      </div>

      {success && (
        <div className="rounded-[8px] border border-[#2f9e52]/40 bg-[#e3f4e8] px-4 py-2.5 text-[12px] text-[#2f9e52]">
          Override applied. This action has been logged.
        </div>
      )}

      <div className="rounded-[16px] border border-[var(--line-soft)] bg-[var(--paper)] p-6 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5 text-[12px]">
            <span className="font-medium text-[var(--ink)]">Resource ID *</span>
            <input
              className={inputCls}
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
              placeholder="Resource ID or paste URL"
            />
          </label>
          <label className="block space-y-1.5 text-[12px]">
            <span className="font-medium text-[var(--ink)]">Action *</span>
            <select className={inputCls} value={action} onChange={(e) => setAction(e.target.value as OverrideAction)}>
              {ACTION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
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
            placeholder="Explain why this override is necessary (minimum 20 characters). This note will appear in the Override Log…"
          />
        </label>

        {mutation.error && (
          <p className="rounded-[8px] bg-[#fbe6e6] px-3 py-2 text-[12px] text-[#d24545]">
            {getErrorMessage(mutation.error, "Override failed.")}
          </p>
        )}

        <div className="flex justify-end">
          <Button type="button" disabled={!canSubmit} onClick={() => mutation.mutate()}>
            {mutation.isPending ? "Applying Override…" : "Apply Override"}
          </Button>
        </div>
      </div>
    </section>
  );
}
