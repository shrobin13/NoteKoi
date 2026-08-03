"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCRStudentVerifications, approveStudentVerification } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyStateBlock } from "@/components/shared/empty-state-block";
import Link from "next/link";

/**
 * Student Verification Queue — Milestone 5 task 2 / wireframe B.17
 * wirefram-resolution.md §2 row: "Approve only. No reject button." (no /reject endpoint exists)
 */
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
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Moderate</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Student Verification Queue</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Pending students in your batch awaiting identity verification. Approve-only — no decline action exists.
          </p>
        </div>
        <Link href="/moderate/cr">
          <Button variant="secondary">← Back to Queue</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-800/60" />
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
        <div className="space-y-3">
          {students.map((student) => (
            <Card
              key={student.userId}
              className="flex flex-col gap-4 border-slate-700/80 bg-slate-900/80 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-medium text-white">{student.name ?? "Unknown"}</p>
                <p className="text-sm text-slate-400">
                  Reg No: <span className="text-slate-200">{student.regNo}</span>
                  {student.college ? <> · {student.college}</> : null}
                </p>
                {student.email && <p className="text-xs text-slate-500">{student.email}</p>}
              </div>
              <Button
                onClick={() => approveMutation.mutate(student.userId)}
                disabled={approveMutation.isPending && approveMutation.variables === student.userId}
              >
                Approve
              </Button>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
