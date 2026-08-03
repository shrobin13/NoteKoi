"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyUploads } from "@/lib/api/resources";

export function useMyUploadsQuery(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["resources", "my-uploads", page, limit],
    queryFn: () => getMyUploads(page, limit),
    staleTime: 1000 * 60 * 2,
  });
}
