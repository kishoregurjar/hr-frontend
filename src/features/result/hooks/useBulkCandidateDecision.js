"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { RESULT_QUERY_KEYS } from "../constants";
import { resultService } from "../services";

const useBulkCandidateDecision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => resultService.updateDecisions(payload),

    onSuccess: (updatedResults) => {
      const assessmentIds = [
        ...new Set(updatedResults.map((result) => result.assessmentId)),
      ];

      assessmentIds.forEach((assessmentId) => {
        queryClient.invalidateQueries({
          queryKey: RESULT_QUERY_KEYS.assessment(assessmentId),
        });

        queryClient.invalidateQueries({
          queryKey: RESULT_QUERY_KEYS.summary(assessmentId),
        });
      });

      updatedResults.forEach((result) => {
        queryClient.setQueryData(
          RESULT_QUERY_KEYS.detail(result.assessmentId, result.id),
          result
        );
      });
    },
  });
};

export default useBulkCandidateDecision;
