"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ASSIGNMENT_QUERY_KEYS } from "../constants";
import { assignmentService } from "../services";

const useSendInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentId) =>
      assignmentService.sendInvitation(assignmentId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ASSIGNMENT_QUERY_KEYS.all,
      });
    },
  });
};

export default useSendInvitation;
