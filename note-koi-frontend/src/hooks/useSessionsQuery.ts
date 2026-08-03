import { useQuery } from "@tanstack/react-query";
import { getSessionsByDepartment } from "@/lib/api/sessions";

export function useSessionsQuery(departmentId: string | undefined) {
  return useQuery({
    queryKey: ["sessions", departmentId],
    queryFn: () => getSessionsByDepartment(departmentId!),
    enabled: !!departmentId,
    staleTime: 1000 * 60 * 10,
  });
}
