"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "@/lib/utils";
import { login } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      router.push("/");
    },
    onError: (error) => {
      setFormError(getErrorMessage(error, "Invalid email or password."));
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setFormError(null);
    mutation.mutate({ email: data.email.trim(), password: data.password.trim() });
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        <Card className="space-y-6 p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Welcome back</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Sign in to NoteKoi</h1>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Email</label>
              <Input
                type="email"
                {...register("email")}
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-xs text-rose-400">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Password</label>
              <Input
                type="password"
                {...register("password")}
                placeholder="Enter your password"
              />
              {errors.password && <p className="text-xs text-rose-400">{errors.password.message}</p>}
            </div>
            {formError ? <p className="text-sm text-rose-400">{formError}</p> : null}
            <Button type="button" onClick={handleSubmit(onSubmit)} className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="space-y-3 text-sm text-slate-300">
            <p>
              <Link href="/forgot-password" className="text-indigo-400 hover:text-indigo-300">
                Forgot password?
              </Link>
            </p>
            <p>
              New to NoteKoi?{" "}
              <Link href="/register/student" className="text-indigo-400 hover:text-indigo-300">
                Register as a student
              </Link>{" "}
              or{" "}
              <Link href="/register/teacher" className="text-indigo-400 hover:text-indigo-300">
                register as a teacher
              </Link>.
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}
