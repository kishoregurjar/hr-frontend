"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CANDIDATE_QUERY_KEYS } from "../constants";
import { candidateService } from "../services";

const useImportCandidates = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (candidates) => candidateService.importMany(candidates),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CANDIDATE_QUERY_KEYS.lists(),
      });
    },
  });
};

export default useImportCandidates;
