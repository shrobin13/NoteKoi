"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCRStudentVerifications, approveStudentVerification } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { EmptyStateBlock } from "@/components/shared/empty-state-block";
import Link from "next/link";

export default function CRStudentVerificationsPage() {
  const qc = useQueryClient();

  const { data: students, isLoading, error } = useQuery({
    queryKey: ["cr-student-verifications"],
    queryFn: getCRStudentVerifications,
    staleTime: 1000 * 60,
  });

  const approveMutation = useMutation({
    mutationFn: (userId: string) => approveStudentVerification(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cr-student-verifications"] }),
  });

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--ink-soft)]">Moderate</p>
          <h1 className="mt-1 text-[22px] font-semibold text-[var(--ink)]">Student Verification Queue</h1>
          <p className="mt-1 text-[12.5px] text-[var(--ink-soft)]">
            Pending students in your batch awaiting identity verification. Approve-only — no decline action exists.
          </p>
        </div>
        <Link href="/moderate/cr">
          <Button variant="secondary">← Back to Queue</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-[12px] border border-[var(--line-soft)] bg-[var(--ph)]" />
          ))}
        </div>
      ) : error ? (
        <EmptyStateBlock
          title="Verification queue unavailable"
          description="Unable to load the student verification queue. Please try again."
        />
      ) : !students?.length ? (
        <EmptyStateBlock
          title="No pending verifications"
          description="There are no students awaiting verification in your batch."
        />
      ) : (
        <div className="space-y-2">
          {students.map((student) => (
            <div
              key={student.userId}
              className="flex flex-col gap-3 rounded-[12px] border border-[var(--line-soft)] bg-[var(--paper)] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-[13px] font-medium text-[var(--ink)]">{student.name ?? "Unknown"}</p>
                <p className="text-[11.5px] text-[var(--ink-soft)]">
                  Reg No: <span className="font-medium text-[var(--ink)]">{student.regNo}</span>
                  {student.college ? <> · {student.college}</> : null}
                </p>
                {student.email && <p className="text-[11px] text-[var(--ink-soft)]">{student.email}</p>}
              </div>
              <Button
                onClick={() => approveMutation.mutate(student.userId)}
                disabled={approveMutation.isPending && approveMutation.variables === student.userId}
              >
                Approve
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
