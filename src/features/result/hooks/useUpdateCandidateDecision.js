"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { RESULT_QUERY_KEYS } from "../constants";
import { resultService } from "../services";

const useUpdateCandidateDecision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => resultService.updateDecision(payload),

    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: RESULT_QUERY_KEYS.assessment(result.assessmentId),
      });

      queryClient.invalidateQueries({
        queryKey: RESULT_QUERY_KEYS.summary(result.assessmentId),
      });

      queryClient.setQueryData(
        RESULT_QUERY_KEYS.detail(result.assessmentId, result.id),
        result
      );
    },
  });
};

export default useUpdateCandidateDecision;
