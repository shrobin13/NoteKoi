"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getErrorMessage } from "@/lib/utils";
import { forgotPassword } from "@/lib/api/auth";
import { AuthFormLayout } from "@/components/shared/auth-form-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => setSuccess(true),
    onError: (error) => setFormError(getErrorMessage(error, "Unable to send reset link."))
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!email.trim()) {
      setFormError("Enter your email address.");
      return;
    }

    mutation.mutate({ email: email.trim() });
  };

  return (
    <AuthFormLayout title="Forgot password" description="Reset your NoteKoi password.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </div>
        {formError ? <p className="text-sm text-rose-400">{formError}</p> : null}
        {success ? (
          <p className="text-sm text-emerald-400">
            Reset link sent. Check your email for instructions.
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={mutation.isPending || success}>
          {mutation.isPending ? "Sending..." : "Send reset link"}
        </Button>
      </form>
      <p className="text-sm text-slate-300">
        Remembered your password? <Link href="/login" className="text-indigo-400 hover:text-indigo-300">Sign in</Link> instead.
      </p>
    </AuthFormLayout>
  );
}
