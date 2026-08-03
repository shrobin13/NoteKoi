"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useUsersQuery } from "@/hooks/useUsersQuery";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Verification Pending Screen — Milestone 2 task 5
 * - TanStack Query polling (refetchInterval: 30000) on GET /users/me
 * - "Refresh status" triggers manual query invalidation
 * - "Return to Discover" is a Next.js Link
 * - Success toast and navigation invalidation once isVerified flips true
 */
export default function VerificationPendingPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [showToast, setShowToast] = useState(false);

  // TanStack Query with 30s polling per Milestone 2 task 5
  const { data: user, refetch, isRefetching } = useUsersQuery();

  useEffect(() => {
    // Override query refetchInterval dynamically on this screen
    qc.setQueryDefaults(["users", "me"], { refetchInterval: 30000 });
  }, [qc]);

  useEffect(() => {
    if (user?.isVerified || user?.teacherVerificationStatus === "APPROVED") {
      setShowToast(true);
      qc.invalidateQueries({ queryKey: ["users", "me"] });
      const timer = setTimeout(() => {
        router.push("/");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [user?.isVerified, user?.teacherVerificationStatus, qc, router]);

  const handleRefresh = async () => {
    await refetch();
    await qc.invalidateQueries({ queryKey: ["users", "me"] });
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-lg">
        {showToast && (
          <div className="mb-6 rounded-2xl border border-green-700/60 bg-green-900/30 p-4 text-center text-sm font-semibold text-green-300 animate-bounce">
            🎉 Your account has been verified! Redirecting to Discover…
          </div>
        )}

        <Card className="space-y-6 p-8 border-slate-700/80 bg-slate-900/80">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Verification pending</p>
              <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-white">Your account is under review</h1>
          </div>

          <p className="text-sm leading-6 text-slate-300">
            We are checking your verification status automatically every 30 seconds. You can still browse the platform in read-only mode while verification is pending.
          </p>

          {user && (
            <div className="rounded-2xl bg-slate-950 p-4 text-xs space-y-1 text-slate-400">
              <p><span className="text-slate-200 font-medium">Account:</span> {user.email}</p>
              <p><span className="text-slate-200 font-medium">Role:</span> {user.role}</p>
              <p>
                <span className="text-slate-200 font-medium">Status:</span>{" "}
                <span className="text-amber-400">Pending Approval</span>
              </p>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/" className="w-full">
              <Button variant="secondary" className="w-full">Return to Discover</Button>
            </Link>
            <Button onClick={handleRefresh} disabled={isRefetching}>
              {isRefetching ? "Checking…" : "Refresh status"}
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
