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
          <div className="rounded-[8px] border border-[#2f9e52]/40 bg-[#e3f4e8] px-4 py-3 text-[12px] text-[#2f9e52]">
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
                className={`flex cursor-pointer items-start gap-3 rounded-[8px] border p-3 transition ${
                  selectedReason === r.value
                    ? "border-[var(--accent)] bg-[var(--ph)]"
                    : "border-[var(--line-soft)] hover:border-[var(--line)]"
                }`}
              >
                <input
                  type="radio"
                  name="reportReason"
                  value={r.value}
                  checked={selectedReason === r.value}
                  onChange={() => setSelectedReason(r.value)}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-[12px] font-semibold text-[var(--ink)]">{r.label}</p>
                  <p className="mt-0.5 text-[11px] text-[var(--ink-soft)]">{r.description}</p>
                </div>
              </label>
            ))}
          </div>

          {reportMutation.error && (
            <p className="rounded-[8px] bg-[#fbe6e6] px-3 py-2 text-[12px] text-[#d24545]">
              Failed to submit report. Please try again.
            </p>
          )}

          <div className="flex justify-end gap-2">
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
