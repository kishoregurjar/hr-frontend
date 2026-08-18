"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CANDIDATE_QUERY_KEYS } from "../constants";
import { candidateService } from "../services";

const useCreateCandidate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => candidateService.create(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CANDIDATE_QUERY_KEYS.lists(),
      });
    },
  });
};

export default useCreateCandidate;
