"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CANDIDATE_QUERY_KEYS } from "../constants";
import { candidateService } from "../services";

const useUpdateCandidate = (candidateId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      candidateService.update({
        id: candidateId,
        data,
      }),

    onSuccess: (updatedCandidate) => {
      queryClient.setQueryData(
        CANDIDATE_QUERY_KEYS.detail(candidateId),
        updatedCandidate
      );

      queryClient.invalidateQueries({
        queryKey: CANDIDATE_QUERY_KEYS.lists(),
      });
    },
  });
};

export default useUpdateCandidate;
