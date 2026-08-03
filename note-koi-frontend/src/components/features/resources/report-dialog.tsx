"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useReportResourceMutation } from "@/hooks/useResourceActionMutations";
import type { ReportReason } from "@/lib/api/resources";

interface ReportDialogProps {
  open: boolean;
  resourceId: string;
  onClose: () => void;
}

const REASONS: { value: ReportReason; label: string; description: string }[] = [
  { value: "INCORRECT", label: "Incorrect Information", description: "Contains incorrect course material, wrong answers, or misleading information." },
  { value: "SPAM", label: "Spam or Off-Topic", description: "Irrelevant content, advertisement, or duplicate submission." },
  { value: "PLAGIARISED", label: "Plagiarised / Copyright Violation", description: "Copied material uploaded without authorization." },
];

/**
 * Report Resource Dialog — Milestone 3 task 6 / wirefram-resolution.md §4 B.10
 * Reasons: Incorrect, Spam, Plagiarised. POST /resources/:id/report
 */
export function ReportDialog({ open, resourceId, onClose }: ReportDialogProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [success, setSuccess] = useState(false);
  const reportMutation = useReportResourceMutation(resourceId);

  function handleClose() {
    setSelectedReason(null);
    setSuccess(false);
    onClose();
  }

  function handleSubmit() {
    if (!selectedReason) return;
    reportMutation.mutate(selectedReason, {
      onSuccess: () => setSuccess(true),
    });
  }

  return (
    <Dialog
      open={open}
      title="Report Resource"
      description="Help us maintain content quality by selecting a reason for reporting this resource."
      onClose={handleClose}
    >
      {success ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-2xl border border-green-700/60 bg-green-900/20 p-4 text-sm text-green-300">
            Thank you. Your report has been submitted to the moderation team for review.
          </div>
          <div className="flex justify-end">
            <Button onClick={handleClose}>Done</Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            {REASONS.map((r) => (
              <label
                key={r.value}
                onClick={() => setSelectedReason(r.value)}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                  selectedReason === r.value
                    ? "border-indigo-500 bg-indigo-950/40"
                    : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="reportReason"
                  value={r.value}
                  checked={selectedReason === r.value}
                  onChange={() => setSelectedReason(r.value)}
                  className="mt-1 accent-indigo-500"
                />
                <div>
                  <p className="font-medium text-white">{r.label}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{r.description}</p>
                </div>
              </label>
            ))}
          </div>

          {reportMutation.error && (
            <p className="rounded-2xl border border-rose-500 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              Failed to submit report. Please try again.
            </p>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={!selectedReason || reportMutation.isPending}
              onClick={handleSubmit}
            >
              {reportMutation.isPending ? "Submitting…" : "Submit Report"}
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
