"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CANDIDATE_QUERY_KEYS } from "../constants";
import { candidateService } from "../services";

const useUploadResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, jobId }) => candidateService.uploadResume({ file, jobId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CANDIDATE_QUERY_KEYS.all,
      });
    },
  });
};

export default useUploadResume;
