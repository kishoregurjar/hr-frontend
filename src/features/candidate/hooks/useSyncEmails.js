"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CANDIDATE_QUERY_KEYS } from "../constants";
import { candidateService } from "../services";

const useSyncEmails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => candidateService.syncEmails(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CANDIDATE_QUERY_KEYS.all,
      });
    },
  });
};

export default useSyncEmails;
