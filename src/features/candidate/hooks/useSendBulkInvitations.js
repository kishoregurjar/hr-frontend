"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ASSIGNMENT_QUERY_KEYS } from "../constants";
import { assignmentService } from "../services";

const useSendBulkInvitations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentIds) =>
      assignmentService.sendBulkInvitations(assignmentIds),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ASSIGNMENT_QUERY_KEYS.all,
      });
    },
  });
};

export default useSendBulkInvitations;
