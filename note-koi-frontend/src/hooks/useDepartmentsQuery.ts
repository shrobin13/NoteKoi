import { useQuery } from "@tanstack/react-query";
import { getDepartments } from "@/lib/api/departments";

export function useDepartmentsQuery() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
    staleTime: 1000 * 60 * 10,
  });
}
