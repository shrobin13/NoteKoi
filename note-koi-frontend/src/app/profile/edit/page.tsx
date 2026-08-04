"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useUpdateCurrentUserMutation } from "@/hooks/useUpdateCurrentUserMutation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getColleges } from "@/lib/api/colleges";
import { getDepartments } from "@/lib/api/departments";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";

const selectCls =
  "w-full rounded-[8px] border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-[12px] text-[var(--ink)] outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] disabled:opacity-50";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, isLoading, error } = useRequireAuth();

  const header = (
    <div>
      <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--ink-soft)]">Profile</p>
      <h1 className="mt-1 text-[22px] font-semibold text-[var(--ink)]">Edit profile</h1>
    </div>
  );

  if (isLoading) {
    return (
      <section className="mx-auto max-w-3xl space-y-6">
        {header}
        <div className="h-60 animate-pulse rounded-[16px] border border-[var(--line-soft)] bg-[var(--ph)]" />
      </section>
    );
  }

  if (error || !user) {
    return (
      <section className="mx-auto max-w-3xl space-y-6">
        {header}
        <div className="rounded-[16px] border border-[var(--line-soft)] bg-[var(--paper)] p-6">
          <p className="text-[12.5px] text-[var(--ink-soft)]">Unable to load your profile. Please refresh the page.</p>
        </div>
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

  const { data: colleges } = useQuery({
    queryKey: ["colleges"],
    queryFn: getColleges,
    staleTime: 1000 * 60 * 10,
  });

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
    staleTime: 1000 * 60 * 10,
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate({
      name: name.trim() || undefined,
      email: email.trim() || undefined,
      collegeId: collegeId || undefined,
      departmentId: departmentId || undefined,
    }, {
      onSuccess: () => router.push("/profile"),
    });
  };

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--ink-soft)]">Profile</p>
        <h1 className="mt-1 text-[22px] font-semibold text-[var(--ink)]">Edit profile</h1>
        <p className="mt-1 text-[12.5px] text-[var(--ink-soft)]">Update your display name, email, and college affiliation.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-[16px] border border-[var(--line-soft)] bg-[var(--paper)] p-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5 text-[12px]">
              <span className="font-medium text-[var(--ink)]">Full name</span>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
            </label>

            <label className="block space-y-1.5 text-[12px]">
              <span className="font-medium text-[var(--ink)]">Email</span>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </label>

            <label className="block space-y-1.5 text-[12px]">
              <span className="font-medium text-[var(--ink)]">College</span>
              <select className={selectCls} value={collegeId} onChange={(e) => setCollegeId(e.target.value)}>
                <option value="">Not set</option>
                {(colleges ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5 text-[12px]">
              <span className="font-medium text-[var(--ink)]">Department</span>
              <select className={selectCls} value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                <option value="">Not set</option>
                {(departments ?? []).map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-[var(--line-soft)] pt-4">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : "Save changes"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
          </div>

          {mutation.isError && (
            <p className="text-[12px] text-[#d24545]">Failed to save changes. Please try again.</p>
          )}
          {mutation.isSuccess && (
            <p className="text-[12px] text-[#2f9e52]">Profile updated successfully.</p>
          )}
        </div>
      </form>
    </section>
  );
}
