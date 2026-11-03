"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCompanySupportStatus } from "@/lib/api/support";
import { SUPPORT_QUERY_KEYS } from "../constants";

/**
 * Mutation hook for updating a company support ticket status.
 * Automatically invalidates and updates the tenant-scoped ticket cache.
 */
export function useUpdateCompanySupportStatus(companyId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, status }) => {
      return updateCompanySupportStatus(requestId, status);
    },
    onSuccess: (_, { requestId, status }) => {
      // Deterministically update any cached list for this company
      queryClient.setQueriesData(
        { queryKey: SUPPORT_QUERY_KEYS.company(companyId) },
        (oldData) => {
          if (!oldData || !Array.isArray(oldData.items)) return oldData;
          return {
            ...oldData,
            items: oldData.items.map((item) =>
              item.id === requestId ? { ...item, status } : item
            ),
          };
        }
      );

      // Invalidate to ensure background sync with server
      queryClient.invalidateQueries({
        queryKey: SUPPORT_QUERY_KEYS.company(companyId),
      });
    },
  });
}

export default useUpdateCompanySupportStatus;

