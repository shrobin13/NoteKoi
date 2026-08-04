"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useUsersQuery } from "@/hooks/useUsersQuery";
import { Button } from "@/components/ui/button";

export default function VerificationPendingPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [showToast, setShowToast] = useState(false);

  const { data: user, refetch, isRefetching } = useUsersQuery();

  useEffect(() => {
    qc.setQueryDefaults(["users", "me"], { refetchInterval: 30000 });
  }, [qc]);

  useEffect(() => {
    if (user?.isVerified || user?.teacherVerificationStatus === "APPROVED") {
      const showTimeout = setTimeout(() => setShowToast(true), 0);
      qc.invalidateQueries({ queryKey: ["users", "me"] });
      const timer = setTimeout(() => router.push("/"), 2500);
      return () => {
        clearTimeout(showTimeout);
        clearTimeout(timer);
      };
    }
  }, [user?.isVerified, user?.teacherVerificationStatus, qc, router]);

  const handleRefresh = async () => {
    await refetch();
    await qc.invalidateQueries({ queryKey: ["users", "me"] });
  };

  return (
    <main className="min-h-screen bg-[var(--canvas)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-lg">
        {showToast && (
          <div className="mb-6 rounded-[12px] border border-[#2f9e52]/40 bg-[#e3f4e8] p-4 text-center text-[12.5px] font-semibold text-[#2f9e52]">
            Your account has been verified! Redirecting to Discover…
          </div>
        )}

        <div className="rounded-[16px] border border-[var(--line-soft)] bg-[var(--paper)] space-y-6 p-8">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--ink-soft)]">
                Verification pending
              </p>
              <span className="flex h-2.5 w-2.5 rounded-full bg-[#c9973b] animate-ping" />
            </div>
            <h1 className="mt-2 text-[24px] font-semibold text-[var(--ink)]">
              Your account is under review
            </h1>
          </div>

          <p className="text-[12.5px] leading-relaxed text-[var(--ink-soft)]">
            We are checking your verification status automatically every 30 seconds. You can still browse the platform in read-only mode while verification is pending.
          </p>

          {user && (
            <div className="rounded-[8px] border border-[var(--line-soft)] bg-[var(--canvas)] p-4 space-y-1.5 text-[11.5px] text-[var(--ink-soft)]">
              <p><span className="font-medium text-[var(--ink)]">Account:</span> {user.email}</p>
              <p><span className="font-medium text-[var(--ink)]">Role:</span> {user.role}</p>
              <p>
                <span className="font-medium text-[var(--ink)]">Status:</span>{" "}
                <span className="text-[#c9973b]">Pending Approval</span>
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
        </div>
      </div>
    </main>
  );
}
