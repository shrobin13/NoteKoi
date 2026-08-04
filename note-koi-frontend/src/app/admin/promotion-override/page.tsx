"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { promotionOverride } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/utils";

type PromotionAction = "APPROVE" | "DENY";

const inputCls =
  "w-full rounded-[8px] border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-[12px] text-[var(--ink)] outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]";

export default function AdminPromotionOverridePage() {
  const [resourceId, setResourceId] = useState("");
  const [action, setAction] = useState<PromotionAction>("APPROVE");
  const [justification, setJustification] = useState("");
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: () => promotionOverride({ resourceId: resourceId.trim(), action, justification }),
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
        <h1 className="mt-1 text-[22px] font-semibold text-[var(--ink)]">Promotion Override</h1>
        <p className="mt-1 text-[12.5px] text-[var(--ink-soft)]">
          Force approve or deny a platform promotion for a resource. Requires a written justification.
        </p>
      </div>

      {success && (
        <div className="rounded-[8px] border border-[#2f9e52]/40 bg-[#e3f4e8] px-4 py-2.5 text-[12px] text-[#2f9e52]">
          Promotion override applied successfully.
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
              placeholder="Resource ID"
            />
          </label>
          <label className="block space-y-1.5 text-[12px]">
            <span className="font-medium text-[var(--ink)]">Promotion Action *</span>
            <select className={inputCls} value={action} onChange={(e) => setAction(e.target.value as PromotionAction)}>
              <option value="APPROVE">Force Approve Promotion</option>
              <option value="DENY">Force Deny Promotion</option>
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
            placeholder="Explain why this promotion override is necessary (minimum 20 characters)…"
          />
        </label>

        {mutation.error && (
          <p className="rounded-[8px] bg-[#fbe6e6] px-3 py-2 text-[12px] text-[#d24545]">
            {getErrorMessage(mutation.error, "Promotion override failed.")}
          </p>
        )}

        <div className="flex justify-end">
          <Button type="button" disabled={!canSubmit} onClick={() => mutation.mutate()}>
            {mutation.isPending ? "Applying Override…" : "Apply Promotion Override"}
          </Button>
        </div>
      </div>
    </section>
  );
}
