"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { getErrorMessage } from "@/lib/utils";
import { resetPassword } from "@/lib/api/auth";
import { AuthFormLayout } from "@/components/shared/auth-form-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[var(--ink-soft)]">Loading…</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1500);
    },
    onError: (error) => setFormError(getErrorMessage(error, "Unable to reset password.")),
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!token) {
      setFormError("Reset token is missing. Please request a new reset link.");
      return;
    }
    if (newPassword.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    mutation.mutate({ token, newPassword });
  };

  return (
    <AuthFormLayout title="Reset password" description="Set a new password for your account.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-[var(--ink)]">New password</label>
          <Input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="New password"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-[var(--ink)]">Confirm password</label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm new password"
          />
        </div>
        {formError ? <p className="text-[12px] text-[#d24545]">{formError}</p> : null}
        {success ? (
          <p className="text-[12px] text-[#2f9e52]">Password reset successfully. Redirecting to login…</p>
        ) : null}
        <Button type="submit" className="w-full" disabled={mutation.isPending || success}>
          {mutation.isPending ? "Resetting…" : "Reset password"}
        </Button>
      </form>
      <p className="text-[12.5px] text-[var(--ink-soft)]">
        Return to <Link href="/login" className="text-[#3f6fd6] hover:underline">Sign in</Link>.
      </p>
    </AuthFormLayout>
  );
}
