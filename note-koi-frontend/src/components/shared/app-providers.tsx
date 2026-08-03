"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/providers/theme-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUsersQuery } from "@/hooks/useUsersQuery";
import { useUserStore } from "@/store/use-user-store";

const queryClient = new QueryClient();

function AppProvidersInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, error } = useUsersQuery();
  const setRole = useUserStore((s) => s.setRole);
  const setVerified = useUserStore((s) => s.setVerified);

  useEffect(() => {
    if (data) {
      setVerified(Boolean(data.isVerified));
      setRole(data.role || "GUEST");
    }
  }, [data, setRole, setVerified]);

  useEffect(() => {
    if (error && typeof error === "object" && error !== null && "status" in error) {
      const status = (error as { status?: number }).status;
      if (status === 401) {
        setVerified(false);
        setRole("GUEST");
        router.push("/login");
      }
    }
  }, [error, router, setRole, setVerified]);

  return <>{children}</>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AppProvidersInner>{children}</AppProvidersInner>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
