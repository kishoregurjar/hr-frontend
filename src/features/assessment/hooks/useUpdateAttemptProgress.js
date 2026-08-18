"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ATTEMPT_QUERY_KEYS } from "../constants";
import { attemptService } from "../services";

const useUpdateAttemptProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ attemptId, currentSection }) =>
      attemptService.updateProgress({ attemptId, currentSection }),

    onSuccess: (attempt) => {
      queryClient.setQueryData(
        ATTEMPT_QUERY_KEYS.detail(attempt.id),
        attempt
      );

      queryClient.setQueryData(
        ATTEMPT_QUERY_KEYS.assignment(attempt.assignmentId),
        attempt
      );
    },
  });
};

export default useUpdateAttemptProgress;
