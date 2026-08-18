"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ASSIGNMENT_QUERY_KEYS } from "@/features/assignment/constants";
import { ATTEMPT_QUERY_KEYS } from "../constants";
import { attemptService } from "../services";

const useSubmitAssessment = (token) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => attemptService.submit(payload),

    onSuccess: ({ assignment, attempt }) => {
      queryClient.setQueryData(
        ASSIGNMENT_QUERY_KEYS.token(token),
        assignment
      );

      queryClient.setQueryData(
        ATTEMPT_QUERY_KEYS.assignment(assignment.id),
        attempt
      );

      queryClient.invalidateQueries({
        queryKey: ["hiring-processes"],
      });

      queryClient.invalidateQueries({
        queryKey: ["assessment-results"],
      });
    },
  });
};

export default useSubmitAssessment;
