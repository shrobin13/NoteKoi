"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "@/lib/utils";
import { getColleges, getCollegeDepartments } from "@/lib/api/colleges";
import { registerTeacher } from "@/lib/api/auth";
import { AuthFormLayout } from "@/components/shared/auth-form-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const teacherRegisterSchema = z.object({
  collegeId: z.string().min(1, "College selection is required"),
  departmentIds: z.array(z.string()).min(1, "Select at least one department"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type TeacherRegisterFormData = z.infer<typeof teacherRegisterSchema>;

export default function TeacherRegisterPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TeacherRegisterFormData>({
    resolver: zodResolver(teacherRegisterSchema),
    defaultValues: {
      collegeId: "",
      departmentIds: [],
      email: "",
      password: "",
    },
  });

  const collegeId = watch("collegeId");
  const departmentIds = watch("departmentIds") ?? [];

  const collegesQuery = useQuery({ queryKey: ["colleges"], queryFn: getColleges, staleTime: 1000 * 60 * 5 });
  const departmentsQuery = useQuery({
    queryKey: ["collegeDepartments", collegeId],
    queryFn: () => getCollegeDepartments(collegeId),
    enabled: Boolean(collegeId),
    staleTime: 1000 * 60 * 5,
  });

  const mutation = useMutation({
    mutationFn: registerTeacher,
    onSuccess: () => router.push("/verification-pending"),
    onError: (error) => setFormError(getErrorMessage(error, "Unable to register teacher.")),
  });

  const availableDepartments = departmentsQuery.data ?? [];

  const handleToggleDepartment = (id: string) => {
    const next = departmentIds.includes(id)
      ? departmentIds.filter((d) => d !== id)
      : [...departmentIds, id];
    setValue("departmentIds", next, { shouldValidate: true });
  };

  const onSubmit = (data: TeacherRegisterFormData) => {
    setFormError(null);
    mutation.mutate({
      email: data.email.trim(),
      password: data.password.trim(),
      collegeId: data.collegeId,
      departmentIds: data.departmentIds,
    });
  };

  return (
    <AuthFormLayout title="Teacher registration" description="Request teacher access to NoteKoi.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">College</label>
          <select
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500"
            value={collegeId}
            onChange={(e) => {
              setValue("collegeId", e.target.value);
              setValue("departmentIds", []);
            }}
          >
            <option value="">Choose a college</option>
            {collegesQuery.data?.map((college) => (
              <option key={college.id} value={college.id}>
                {college.name}
              </option>
            ))}
          </select>
          {errors.collegeId && <p className="text-xs text-rose-400">{errors.collegeId.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Departments (Multi-select)</label>
          <div className="rounded-3xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-100">
            {availableDepartments.length > 0 ? (
              availableDepartments.map((department) => (
                <label key={department.id} className="flex items-center gap-3 py-2 cursor-pointer">
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
          {errors.departmentIds && <p className="text-xs text-rose-400">{errors.departmentIds.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Email</label>
          <Input type="email" {...register("email")} placeholder="you@example.com" />
          {errors.email && <p className="text-xs text-rose-400">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Password</label>
          <Input type="password" {...register("password")} placeholder="Create a password" />
          {errors.password && <p className="text-xs text-rose-400">{errors.password.message}</p>}
        </div>

        {formError ? <p className="text-sm text-rose-400">{formError}</p> : null}

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Registering..." : "Register"}
        </Button>
      </form>

      <p className="text-sm text-slate-300">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
          Sign in
        </Link>.
      </p>
    </AuthFormLayout>
  );
}
