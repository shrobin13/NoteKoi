"use client";

import { useQuery } from "@tanstack/react-query";
import { getResourceVersions } from "@/lib/api/resources";

/** Hook for GET /resources/:rootId/versions — Milestone 3 task 5 / wirefram-resolution.md §4 B.11 */
export function useResourceVersionsQuery(rootId: string) {
  return useQuery({
    queryKey: ["resources", rootId, "versions"],
    queryFn: () => getResourceVersions(rootId),
    enabled: !!rootId,
    staleTime: 1000 * 60 * 5,
  });
}
