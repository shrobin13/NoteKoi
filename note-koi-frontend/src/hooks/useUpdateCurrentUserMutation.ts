"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCurrentUser } from "@/lib/api/users";

export function useUpdateCurrentUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
    }
  });
}
