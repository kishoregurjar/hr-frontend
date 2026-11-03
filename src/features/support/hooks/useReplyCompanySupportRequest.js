"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { replyCompanySupportRequest } from "@/lib/api/support";
import { SUPPORT_QUERY_KEYS } from "../constants";

/**
 * Mutation hook for replying to a company support ticket.
 * Automatically marks ticket as RESOLVED and updates cached ticket queries.
 */
export function useReplyCompanySupportRequest(companyId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, reply }) => {
      return replyCompanySupportRequest(requestId, reply);
    },
    onSuccess: (result, { requestId, reply }) => {
      const nowIso = new Date().toISOString();

      // Deterministically update any cached list for this company
      queryClient.setQueriesData(
        { queryKey: SUPPORT_QUERY_KEYS.company(companyId) },
        (oldData) => {
          if (!oldData || !Array.isArray(oldData.items)) return oldData;
          return {
            ...oldData,
            items: oldData.items.map((item) =>
              item.id === requestId
                ? {
                    ...item,
                    adminReply: reply,
                    repliedAt: nowIso,
                    status: "RESOLVED",
                  }
                : item
            ),
          };
        }
      );

      // Invalidate to synchronize full server state
      queryClient.invalidateQueries({
        queryKey: SUPPORT_QUERY_KEYS.company(companyId),
      });
    },
  });
}

export default useReplyCompanySupportRequest;

