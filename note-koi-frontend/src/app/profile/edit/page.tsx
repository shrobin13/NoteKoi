"use client";

import { useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useUpdateCurrentUserMutation } from "@/hooks/useUpdateCurrentUserMutation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, isLoading, error } = useRequireAuth();

  if (isLoading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Profile</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Edit profile</h1>
          <p className="mt-2 max-w-2xl text-slate-300">Loading your profile...</p>
        </div>
        <Card className="h-80 rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6" />
      </section>
    );
  }

  if (error || !user) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Profile</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Edit profile</h1>
          <p className="mt-2 max-w-2xl text-slate-300">Unable to load your profile at this time.</p>
        </div>
        <Card className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6">
          <p className="text-sm text-slate-400">Please refresh the page or try again later.</p>
        </Card>
      </section>
    );
  }

  return <EditProfileForm user={user} router={router} />;
}

function EditProfileForm({ user, router }: { user: User; router: ReturnType<typeof useRouter> }) {
  const [name, setName] = useState(user.name ?? "");
  const [email, setEmail] = useState(user.email);
  const [collegeId, setCollegeId] = useState(user.collegeId ?? "");
  const [departmentId, setDepartmentId] = useState(user.departmentId ?? "");
  const mutation = useUpdateCurrentUserMutation();

  const isSaving = mutation.isPending;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate({
      name: name || undefined,
      email: email || undefined,
      collegeId: collegeId || undefined,
      departmentId: departmentId || undefined,
    });
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Profile</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Edit profile</h1>
        <p className="mt-2 max-w-2xl text-slate-300">
          Update your display name, email, and college affiliation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="space-y-6 border-slate-700/80 bg-slate-900/80 p-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Full name</label>
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Email</label>
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">College ID</label>
              <Input value={collegeId} onChange={(event) => setCollegeId(event.target.value)} placeholder="College identifier" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Department ID</label>
              <Input value={departmentId} onChange={(event) => setDepartmentId(event.target.value)} placeholder="Department identifier" />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
          {mutation.isError ? (
            <p className="text-sm text-rose-400">Failed to save changes. Please try again.</p>
          ) : null}
          {mutation.isSuccess ? (
            <p className="text-sm text-emerald-400">Profile updated successfully.</p>
          ) : null}
        </Card>
      </form>
    </section>
  );
}
