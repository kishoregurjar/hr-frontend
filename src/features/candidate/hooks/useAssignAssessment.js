"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ASSIGNMENT_QUERY_KEYS } from "../constants";
import { assignmentService } from "../services";

const useAssignAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assessmentId, candidateIds }) =>
      assignmentService.assign({
        assessmentId,
        candidateIds,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ASSIGNMENT_QUERY_KEYS.all,
      });
    },
  });
};

export default useAssignAssessment;
