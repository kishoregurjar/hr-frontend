"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CANDIDATE_QUERY_KEYS } from "../constants";
import { candidateService } from "../services";

const useUpdateCandidateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => candidateService.updateStatus({ id, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CANDIDATE_QUERY_KEYS.all,
      });
    },
  });
};

export default useUpdateCandidateStatus;
