"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api/users";

export function useUsersQuery() {
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}
