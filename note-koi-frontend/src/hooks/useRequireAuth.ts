"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUsersQuery } from "@/hooks/useUsersQuery";

export function useRequireAuth() {
  const router = useRouter();
  const { data: user, isLoading, error } = useUsersQuery();

  useEffect(() => {
    if (
      !isLoading &&
      !user &&
      error &&
      typeof error === "object" &&
      "status" in error &&
      (error as { status?: number }).status === 401
    ) {
      router.push("/login");
    }
  }, [error, isLoading, router, user]);

  return { user, isLoading, error };
}
