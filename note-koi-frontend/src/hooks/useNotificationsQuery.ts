import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "@/lib/api/notifications";

export function useNotificationsQuery(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["notifications", { page, limit }],
    queryFn: () => getNotifications({ page, limit })
  });
}
