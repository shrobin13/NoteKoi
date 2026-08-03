"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useLogoutMutation } from "@/hooks/useLogoutMutation";

export default function ProfilePage() {
  const { user, isLoading, error } = useRequireAuth();
  const logoutMutation = useLogoutMutation();

  if (isLoading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Profile</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Your account</h1>
          <p className="mt-2 max-w-2xl text-slate-300">Loading profile details...</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <Card className="space-y-6 border-slate-700/80 bg-slate-900/80 p-6">
            <div className="h-40 rounded-3xl bg-slate-950/70 p-6" />
          </Card>
          <Card className="h-40 border-slate-700/80 bg-slate-900/80 p-6" />
        </div>
      </section>
    );
  }

  if (error || !user) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Profile</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Your account</h1>
          <p className="mt-2 max-w-2xl text-slate-300">Unable to load profile details right now.</p>
        </div>
        <Card className="border-slate-700/80 bg-slate-900/80 p-6">
          <p className="text-sm text-slate-400">Please refresh or try again later.</p>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Profile</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Your account</h1>
        <p className="mt-2 max-w-2xl text-slate-300">
          Manage your profile, role, and verification status. This screen shows your current account information.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="space-y-6 border-slate-700/80 bg-slate-900/80 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">{user.name ?? user.email}</h2>
              <p className="text-sm text-slate-400">{user.email}</p>
            </div>
            <Badge tone={user.isVerified ? "green" : "amber"}>
              {user.isVerified ? "Verified" : "Pending verification"}
            </Badge>
          </div>

          <div className="grid gap-3 rounded-3xl bg-slate-950/70 p-4 text-sm text-slate-300">
            <div className="flex items-center justify-between">
              <span>Role</span>
              <span className="font-semibold text-white">{user.role}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>College</span>
              <span className="font-semibold text-white">{user.collegeId ?? "Not set"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Department</span>
              <span className="font-semibold text-white">{user.departmentId ?? "Not set"}</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/profile/edit"
              className="inline-flex items-center justify-center rounded-xl bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-600"
            >
              Edit Profile
            </Link>
            <Button
              variant="ghost"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
          {logoutMutation.isError ? (
            <p className="text-sm text-rose-400">Unable to sign out. Please try again.</p>
          ) : null}
        </Card>

        <Card className="border-slate-700/80 bg-slate-900/80 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Activity summary</p>
          <div className="mt-4 space-y-4">
            <div className="rounded-3xl bg-slate-950/70 p-4 text-sm text-slate-300">
              <p className="font-semibold text-white">Recently viewed</p>
              <p className="mt-1 text-slate-500">No entries yet.</p>
            </div>
            <div className="rounded-3xl bg-slate-950/70 p-4 text-sm text-slate-300">
              <p className="font-semibold text-white">Uploads</p>
              <p className="mt-1 text-slate-500">No uploads yet.</p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
