"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ASSIGNMENT_QUERY_KEYS } from "../constants";
import { assignmentService } from "../services";

const useResendInvitation = ({ hiringProcessId, roundId } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentId) => assignmentService.resend(assignmentId),

    onSuccess: (assignment) => {
      if (hiringProcessId && roundId) {
        queryClient.invalidateQueries({
          queryKey: ASSIGNMENT_QUERY_KEYS.round(hiringProcessId, roundId),
        });
      }

      queryClient.setQueryData(
        ASSIGNMENT_QUERY_KEYS.token(assignment.token),
        assignment
      );
    },
  });
};

export default useResendInvitation;
