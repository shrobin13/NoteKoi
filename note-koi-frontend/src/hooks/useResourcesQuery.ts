import { useQuery } from "@tanstack/react-query";
import { getResources } from "@/lib/api/resources";

export function useResourcesQuery(params: Parameters<typeof getResources>[0] = {}) {
  const { page = 1, limit = 20 } = params;
  return useQuery({
    queryKey: ["resources", params],
    queryFn: () => getResources({ ...params, page, limit })
  });
}
