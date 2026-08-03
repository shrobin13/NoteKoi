"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTeacherVerifications, approveTeacherVerification } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyStateBlock } from "@/components/shared/empty-state-block";
import Link from "next/link";

/**
 * Teacher Verification Queue — Milestone 6 task 2 / wireframe B.19
 * wirefram-resolution.md §2 row: "Approve only. No reject." (no /reject endpoint exists for teacher verifications)
 */
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
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Manage</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Teacher Verification Queue</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Approve pending teacher registrations for your college. Approve-only — no decline action exists.
          </p>
        </div>
        <Link href="/manage/sub-admin/queue">
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
          description="Unable to load the teacher verification queue. Please try again."
        />
      ) : !teachers?.length ? (
        <EmptyStateBlock
          title="No pending teacher verifications"
          description="There are no teachers awaiting verification for your college."
        />
      ) : (
        <div className="space-y-3">
          {teachers.map((teacher) => (
            <Card
              key={teacher.userId}
              className="flex flex-col gap-4 border-slate-700/80 bg-slate-900/80 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-medium text-white">{teacher.name ?? "Unknown"}</p>
                <p className="text-sm text-slate-400">
                  {teacher.college && <>{teacher.college} · </>}
                  {teacher.departments?.join(", ")}
                </p>
                {teacher.email && <p className="text-xs text-slate-500">{teacher.email}</p>}
              </div>
              <Button
                onClick={() => approveMutation.mutate(teacher.userId)}
                disabled={approveMutation.isPending && approveMutation.variables === teacher.userId}
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
