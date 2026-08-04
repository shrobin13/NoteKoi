"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTeacherVerifications, approveTeacherVerification } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { EmptyStateBlock } from "@/components/shared/empty-state-block";
import Link from "next/link";

export default function TeacherVerificationsPage() {
  const qc = useQueryClient();

  const { data: teachers, isLoading, error } = useQuery({
    queryKey: ["sub-admin-teacher-verifications"],
    queryFn: getTeacherVerifications,
    staleTime: 1000 * 60,
  });

  const approveMutation = useMutation({
    mutationFn: (userId: string) => approveTeacherVerification(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sub-admin-teacher-verifications"] }),
  });

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--ink-soft)]">Manage</p>
          <h1 className="mt-1 text-[22px] font-semibold text-[var(--ink)]">Teacher Verification Queue</h1>
          <p className="mt-1 text-[12.5px] text-[var(--ink-soft)]">
            Approve pending teacher registrations for your college. Approve-only — no decline action exists.
          </p>
        </div>
        <Link href="/manage/sub-admin/queue">
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
          description="Unable to load the teacher verification queue. Please try again."
        />
      ) : !teachers?.length ? (
        <EmptyStateBlock
          title="No pending teacher verifications"
          description="There are no teachers awaiting verification for your college."
        />
      ) : (
        <div className="space-y-2">
          {teachers.map((teacher) => (
            <div
              key={teacher.userId}
              className="flex flex-col gap-4 rounded-[12px] border border-[var(--line-soft)] bg-[var(--paper)] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-[13px] font-medium text-[var(--ink)]">{teacher.name ?? "Unknown"}</p>
                <p className="text-[11.5px] text-[var(--ink-soft)]">
                  {teacher.college && <>{teacher.college} · </>}
                  {teacher.departments?.join(", ")}
                </p>
                {teacher.email && <p className="text-[11px] text-[var(--ink-soft)]">{teacher.email}</p>}
              </div>
              <Button
                onClick={() => approveMutation.mutate(teacher.userId)}
                disabled={approveMutation.isPending && approveMutation.variables === teacher.userId}
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
