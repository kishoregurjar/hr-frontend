"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ATTEMPT_QUERY_KEYS } from "../constants";
import { attemptService } from "../services";

const useSaveAttemptProgress = (assignmentId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => attemptService.save(payload),

    onSuccess: (attempt) => {
      if (assignmentId) {
        queryClient.setQueryData(
          ATTEMPT_QUERY_KEYS.assignment(assignmentId),
          attempt
        );
      }
    },
  });
};

export default useSaveAttemptProgress;
