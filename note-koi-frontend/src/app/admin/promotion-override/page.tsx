"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { promotionOverride } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/utils";

type PromotionAction = "APPROVE" | "DENY";

/**
 * Promotion Override — Milestone 7 task 5 / wireframe B.26
 * Requires Justification Note (min 20 chars) per Milestone 7 §Validation.
 * POST /platform-admin/promotion-override (wirefram-resolution.md §4 B.26).
 */
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
    <section className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Administration</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Promotion Override</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Force approve or deny a platform promotion for a resource. Requires a written justification.
        </p>
      </div>

      {success && (
        <div className="mb-6 rounded-2xl border border-green-700/60 bg-green-900/20 px-4 py-3 text-sm text-green-300">
          Promotion override applied successfully.
        </div>
      )}

      <Card className="border-slate-700/80 bg-slate-900/80 p-6">
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2 text-sm">
              <span className="font-medium text-slate-200">Resource ID *</span>
              <input
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
                placeholder="Resource ID"
              />
            </label>
            <label className="block space-y-2 text-sm">
              <span className="font-medium text-slate-200">Promotion Action *</span>
              <select
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500"
                value={action}
                onChange={(e) => setAction(e.target.value as PromotionAction)}
              >
                <option value="APPROVE">Force Approve Promotion</option>
                <option value="DENY">Force Deny Promotion</option>
              </select>
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
              placeholder="Explain why this promotion override is necessary (minimum 20 characters)…"
            />
          </label>

          {mutation.error && (
            <p className="rounded-2xl border border-rose-500 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {getErrorMessage(mutation.error, "Promotion override failed.")}
            </p>
          )}

          <div className="flex justify-end">
            <Button type="button" disabled={!canSubmit} onClick={() => mutation.mutate()}>
              {mutation.isPending ? "Applying Override…" : "Apply Promotion Override"}
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}
