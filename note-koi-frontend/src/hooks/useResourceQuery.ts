"use client";

import { useQuery } from "@tanstack/react-query";
import { getResourceById } from "@/lib/api/resources";

export function useResourceQuery(id: string) {
  return useQuery({
    queryKey: ["resource", id],
    queryFn: () => getResourceById(id),
    enabled: Boolean(id)
  });
}
