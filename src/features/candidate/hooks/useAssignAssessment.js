"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ASSIGNMENT_QUERY_KEYS } from "../constants";
import { assignmentService } from "../services";

const useAssignAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables) => assignmentService.assign(variables),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ASSIGNMENT_QUERY_KEYS.all,
      });
    },
  });
};

export default useAssignAssessment;
