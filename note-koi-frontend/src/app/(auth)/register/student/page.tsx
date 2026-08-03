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
import { getSessionsByDepartment } from "@/lib/api/sessions";
import { registerStudent } from "@/lib/api/auth";
import { AuthFormLayout } from "@/components/shared/auth-form-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const studentRegisterSchema = z.object({
  collegeId: z.string().min(1, "College selection is required"),
  departmentId: z.string().min(1, "Department selection is required"),
  sessionId: z.string().min(1, "Session selection is required"),
  regNo: z.string().min(1, "Registration number is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type StudentRegisterFormData = z.infer<typeof studentRegisterSchema>;

export default function StudentRegisterPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StudentRegisterFormData>({
    resolver: zodResolver(studentRegisterSchema),
    defaultValues: {
      collegeId: "",
      departmentId: "",
      sessionId: "",
      regNo: "",
      email: "",
      password: "",
    },
  });

  const collegeId = watch("collegeId");
  const departmentId = watch("departmentId");

  const collegesQuery = useQuery({ queryKey: ["colleges"], queryFn: getColleges, staleTime: 1000 * 60 * 5 });
  const departmentsQuery = useQuery({
    queryKey: ["collegeDepartments", collegeId],
    queryFn: () => getCollegeDepartments(collegeId),
    enabled: Boolean(collegeId),
    staleTime: 1000 * 60 * 5,
  });
  const sessionsQuery = useQuery({
    queryKey: ["departmentSessions", departmentId],
    queryFn: () => getSessionsByDepartment(departmentId),
    enabled: Boolean(departmentId),
    staleTime: 1000 * 60 * 5,
  });

  const mutation = useMutation({
    mutationFn: registerStudent,
    onSuccess: () => router.push("/verification-pending"),
    onError: (error) => setFormError(getErrorMessage(error, "Unable to register student.")),
  });

  const availableDepartments = departmentsQuery.data ?? [];
  const availableSessions = sessionsQuery.data ?? [];

  const handleCollegeChange = (value: string) => {
    setValue("collegeId", value);
    setValue("departmentId", "");
    setValue("sessionId", "");
  };

  const handleDepartmentChange = (value: string) => {
    setValue("departmentId", value);
    setValue("sessionId", "");
  };

  const onSubmit = (data: StudentRegisterFormData) => {
    setFormError(null);
    mutation.mutate({
      email: data.email.trim(),
      password: data.password.trim(),
      collegeId: data.collegeId,
      departmentId: data.departmentId,
      sessionId: data.sessionId,
      regNo: data.regNo.trim(),
    });
  };

  return (
    <AuthFormLayout title="Student registration" description="Create your student account.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">College</label>
          <select
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500"
            value={collegeId}
            onChange={(e) => handleCollegeChange(e.target.value)}
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
          <label className="text-sm font-medium text-slate-200">Department</label>
          <select
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500"
            value={departmentId}
            onChange={(e) => handleDepartmentChange(e.target.value)}
            disabled={!collegeId}
          >
            <option value="">Choose a department</option>
            {availableDepartments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
          {errors.departmentId && <p className="text-xs text-rose-400">{errors.departmentId.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Session</label>
          <select
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500"
            {...register("sessionId")}
            disabled={!departmentId}
          >
            <option value="">Choose a session</option>
            {availableSessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.label}
              </option>
            ))}
          </select>
          {errors.sessionId && <p className="text-xs text-rose-400">{errors.sessionId.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Reg No</label>
          <Input {...register("regNo")} placeholder="Enter registration number" />
          {errors.regNo && <p className="text-xs text-rose-400">{errors.regNo.message}</p>}
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
