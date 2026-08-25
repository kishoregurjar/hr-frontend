"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CANDIDATE_QUERY_KEYS } from "../constants";
import { candidateService } from "../services";

const useExtractCandidate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rawEmailText) => candidateService.extractFromEmail(rawEmailText),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CANDIDATE_QUERY_KEYS.all,
      });
    },
  });
};

export default useExtractCandidate;
