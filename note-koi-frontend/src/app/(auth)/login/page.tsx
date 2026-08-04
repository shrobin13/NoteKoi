"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "@/lib/utils";
import { login } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthFormLayout } from "@/components/shared/auth-form-layout";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function ServerErrorBanner() {
  const params = useSearchParams();
  const error = params.get("error");
  if (!error) return null;
  const msg =
    error === "missing"
      ? "Email and password are required."
      : "Invalid email or password.";
  return <p className="text-[12px] text-[#d24545]">{msg}</p>;
}

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
    <AuthFormLayout title="Sign in to NoteKoi" description="Welcome back" showSignIn={false}>
      {/* Native form fallback for when JS is blocked */}
      <form
        action="/api/login"
        method="post"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-[var(--ink)]">Email</label>
          <Input
            type="email"
            {...register("email")}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="text-[11px] text-[#d24545]">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-[var(--ink)]">Password</label>
          <Input
            type="password"
            {...register("password")}
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="text-[11px] text-[#d24545]">{errors.password.message}</p>
          )}
        </div>

        {formError ? <p className="text-[12px] text-[#d24545]">{formError}</p> : null}
        <Suspense fallback={null}>
          <ServerErrorBanner />
        </Suspense>

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Signing in…" : "Sign In"}
        </Button>
      </form>

      <div className="space-y-2 text-[12.5px] text-[var(--ink-soft)]">
        <p>
          <Link href="/forgot-password" className="text-[#3f6fd6] hover:underline">
            Forgot password?
          </Link>
        </p>
        <p>
          New to NoteKoi?{" "}
          <Link href="/register/student" className="text-[#3f6fd6] hover:underline">
            Register as a student
          </Link>{" "}
          or{" "}
          <Link href="/register/teacher" className="text-[#3f6fd6] hover:underline">
            register as a teacher
          </Link>
          .
        </p>
      </div>
    </AuthFormLayout>
  );
}
