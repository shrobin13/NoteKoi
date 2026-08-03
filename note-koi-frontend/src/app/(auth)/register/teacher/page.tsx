"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "@/lib/utils";
import { getColleges } from "@/lib/api/colleges";
import { getCollegeDepartments } from "@/lib/api/colleges";
import { registerTeacher } from "@/lib/api/auth";
import { AuthFormLayout } from "@/components/shared/auth-form-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TeacherRegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [departmentIds, setDepartmentIds] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const collegesQuery = useQuery({ queryKey: ["colleges"], queryFn: getColleges, staleTime: 1000 * 60 * 5 });
  const departmentsQuery = useQuery({
    queryKey: ["collegeDepartments", collegeId],
    queryFn: () => getCollegeDepartments(collegeId),
    enabled: Boolean(collegeId),
    staleTime: 1000 * 60 * 5
  });

  const mutation = useMutation({
    mutationFn: registerTeacher,
    onSuccess: () => router.push("/verification-pending"),
    onError: (error) => setFormError(getErrorMessage(error, "Unable to register teacher."))
  });

  const availableDepartments = departmentsQuery.data ?? [];
  const canSubmit = useMemo(
    () =>
      Boolean(email.trim() && password.trim().length >= 8 && collegeId && departmentIds.length > 0),
    [email, password, collegeId, departmentIds]
  );

  const handleToggleDepartment = (departmentId: string) => {
    setDepartmentIds((current) =>
      current.includes(departmentId)
        ? current.filter((id) => id !== departmentId)
        : [...current, departmentId]
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!canSubmit) {
      setFormError("Please complete all required fields and choose at least one department.");
      return;
    }

    mutation.mutate({
      email: email.trim(),
      password: password.trim(),
      collegeId,
      departmentIds
    });
  };

  return (
    <AuthFormLayout title="Teacher registration" description="Request teacher access to NoteKoi.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">College</label>
          <select
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            value={collegeId}
            onChange={(event) => {
              setCollegeId(event.target.value);
              setDepartmentIds([]);
            }}
          >
            <option value="">Choose a college</option>
            {collegesQuery.data?.map((college) => (
              <option key={college.id} value={college.id}>
                {college.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Departments</label>
          <div className="rounded-3xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-100">
            {availableDepartments.length > 0 ? (
              availableDepartments.map((department) => (
                <label key={department.id} className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    checked={departmentIds.includes(department.id)}
                    onChange={() => handleToggleDepartment(department.id)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
                  />
                  <span>{department.name}</span>
                </label>
              ))
            ) : (
              <p className="text-slate-500">Choose a college to view departments.</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a password"
          />
        </div>

        {formError ? <p className="text-sm text-rose-400">{formError}</p> : null}
        {mutation.isSuccess ? (
          <p className="text-sm text-emerald-400">Registration successful. Redirecting to verification pending...</p>
        ) : null}

        <Button type="submit" className="w-full" disabled={mutation.isPending || !canSubmit}>
          {mutation.isPending ? "Registering..." : "Register"}
        </Button>
      </form>
      <p className="text-sm text-slate-300">
        Already have an account? <Link href="/login" className="text-indigo-400 hover:text-indigo-300">Sign in</Link>.
      </p>
    </AuthFormLayout>
  );
}
