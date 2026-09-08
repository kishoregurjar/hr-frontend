"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CANDIDATE_QUERY_KEYS } from "../constants";
import { candidateService } from "../services";

const useCreateCandidate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => candidateService.create(payload),

    onSuccess: (newCandidate) => {
      if (newCandidate) {
        queryClient.setQueriesData(
          { queryKey: CANDIDATE_QUERY_KEYS.all },
          (oldData) => {
            if (!oldData) return [newCandidate];
            if (Array.isArray(oldData)) {
              const exists = oldData.some(
                (c) =>
                  String(c.id) === String(newCandidate.id) ||
                  (c.email && c.email.toLowerCase() === newCandidate.email?.toLowerCase())
              );
              return exists ? oldData : [newCandidate, ...oldData];
            }
            return oldData;
          }
        );
      }

      queryClient.invalidateQueries({
        queryKey: CANDIDATE_QUERY_KEYS.all,
      });
    },
  });
};

export default useCreateCandidate;
