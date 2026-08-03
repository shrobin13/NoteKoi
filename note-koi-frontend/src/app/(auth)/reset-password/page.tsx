"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { getErrorMessage } from "@/lib/utils";
import { resetPassword } from "@/lib/api/auth";
import { AuthFormLayout } from "@/components/shared/auth-form-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
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
    onError: (error) => setFormError(getErrorMessage(error, "Unable to reset password."))
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
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">New password</label>
          <Input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="New password"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Confirm password</label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm new password"
          />
        </div>
        {formError ? <p className="text-sm text-rose-400">{formError}</p> : null}
        {success ? (
          <p className="text-sm text-emerald-400">Password reset successfully. Redirecting to login...</p>
        ) : null}
        <Button type="submit" className="w-full" disabled={mutation.isPending || success}>
          {mutation.isPending ? "Resetting..." : "Reset password"}
        </Button>
      </form>
      <p className="text-sm text-slate-300">
        Return to <Link href="/login" className="text-indigo-400 hover:text-indigo-300">Sign in</Link>.
      </p>
    </AuthFormLayout>
  );
}
