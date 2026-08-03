import { useQuery } from "@tanstack/react-query";
import { getCoursesByDepartment } from "@/lib/api/courses";

export function useCoursesQuery(departmentId: string | undefined) {
  return useQuery({
    queryKey: ["courses", departmentId],
    queryFn: () => getCoursesByDepartment(departmentId!),
    enabled: !!departmentId,
    staleTime: 1000 * 60 * 10,
  });
}
