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
  name: z.string().min(1, "Name is required"),
  collegeId: z.string().min(1, "College selection is required"),
  departmentId: z.string().min(1, "Department selection is required"),
  sessionId: z.string().min(1, "Session selection is required"),
  regNo: z.string().min(1, "Registration number is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type StudentRegisterFormData = z.infer<typeof studentRegisterSchema>;

const selectCls =
  "w-full rounded-[8px] border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-[12px] text-[var(--ink)] outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] disabled:opacity-50";

export default function StudentRegisterPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StudentRegisterFormData>({
    resolver: zodResolver(studentRegisterSchema),
    defaultValues: {
      name: "",
      collegeId: "",
      departmentId: "",
      sessionId: "",
      regNo: "",
      email: "",
      password: "",
      confirmPassword: "",
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

  const onSubmit = (data: StudentRegisterFormData) => {
    setFormError(null);
    mutation.mutate({
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password,
      collegeId: data.collegeId,
      departmentId: data.departmentId,
      sessionId: data.sessionId,
      regNo: data.regNo.trim(),
    });
  };

  return (
    <AuthFormLayout title="Student registration" description="Create your student account.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-[var(--ink)]">Full Name</label>
          <Input {...register("name")} placeholder="Your full name" />
          {errors.name && <p className="text-[11px] text-[#d24545]">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-[var(--ink)]">College</label>
          <select
            className={selectCls}
            value={collegeId}
            onChange={(e) => {
              setValue("collegeId", e.target.value, { shouldValidate: true });
              setValue("departmentId", "");
              setValue("sessionId", "");
            }}
          >
            <option value="">Choose a college</option>
            {collegesQuery.data?.map((college) => (
              <option key={college.id} value={college.id}>{college.name}</option>
            ))}
          </select>
          {errors.collegeId && <p className="text-[11px] text-[#d24545]">{errors.collegeId.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-[var(--ink)]">Department</label>
          <select
            className={selectCls}
            value={watch("departmentId")}
            onChange={(e) => {
              setValue("departmentId", e.target.value, { shouldValidate: true });
              setValue("sessionId", "");
            }}
            disabled={!collegeId}
          >
            <option value="">{!collegeId ? "Select college first" : "Choose a department"}</option>
            {availableDepartments.map((department) => (
              <option key={department.id} value={department.id}>{department.name}</option>
            ))}
          </select>
          {errors.departmentId && <p className="text-[11px] text-[#d24545]">{errors.departmentId.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-[var(--ink)]">Session</label>
          <select
            className={selectCls}
            {...register("sessionId")}
            disabled={!departmentId}
          >
            <option value="">{!departmentId ? "Select department first" : "Choose a session"}</option>
            {availableSessions.map((session) => (
              <option key={session.id} value={session.id}>{session.label}</option>
            ))}
          </select>
          {errors.sessionId && <p className="text-[11px] text-[#d24545]">{errors.sessionId.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-[var(--ink)]">Registration No.</label>
          <Input {...register("regNo")} placeholder="e.g. 2021-CSE-001" />
          {errors.regNo && <p className="text-[11px] text-[#d24545]">{errors.regNo.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-[var(--ink)]">Email</label>
          <Input type="email" {...register("email")} placeholder="you@example.com" />
          {errors.email && <p className="text-[11px] text-[#d24545]">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-[var(--ink)]">Password</label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Create a password (8+ chars)"
              className="pr-16"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && <p className="text-[11px] text-[#d24545]">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-[var(--ink)]">Confirm Password</label>
          <div className="relative">
            <Input
              type={showConfirm ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="Re-enter your password"
              className="pr-16"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors"
            >
              {showConfirm ? "Hide" : "Show"}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-[11px] text-[#d24545]">{errors.confirmPassword.message}</p>}
        </div>

        {formError && (
          <p className="rounded-[8px] bg-[#fbe6e6] px-3 py-2 text-[12px] text-[#d24545]">{formError}</p>
        )}

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Registering…" : "Create account"}
        </Button>
      </form>

      <p className="text-[12.5px] text-[var(--ink-soft)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[#3f6fd6] hover:underline">Sign in</Link>.
      </p>
    </AuthFormLayout>
  );
}
