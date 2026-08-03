"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/providers/theme-provider";
import { useEffect } from "react";
import { useUsersQuery } from "@/hooks/useUsersQuery";
import { useUserStore } from "@/store/use-user-store";
import { useQuery } from "@tanstack/react-query";
import { getUserAssignments } from "@/lib/api/users";

const queryClient = new QueryClient();

function AppProvidersInner({ children }: { children: React.ReactNode }) {
  const { data, error } = useUsersQuery();
  const setRole = useUserStore((s) => s.setRole);
  const setVerified = useUserStore((s) => s.setVerified);

  const { data: assignments } = useQuery({
    queryKey: ["users", "me", "assignments"],
    queryFn: getUserAssignments,
    enabled: data?.role === "STUDENT",
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  useEffect(() => {
    if (data) {
      setVerified(Boolean(data.isVerified));
      const activeCr = assignments?.find((a) => a.isActive && a.type === "CR");
      const activeCoCr = assignments?.find((a) => a.isActive && a.type === "CO_CR");
      if (activeCr) {
        setRole("CR");
      } else if (activeCoCr) {
        setRole("CO_CR");
      } else {
        setRole(data.role || "GUEST");
      }
    }
  }, [data, assignments, setRole, setVerified]);

  useEffect(() => {
    if (error && typeof error === "object" && error !== null && "status" in error) {
      if ((error as { status?: number }).status === 401) {
        setVerified(false);
        setRole("GUEST");
      }
    }
  }, [error, setRole, setVerified]);

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
