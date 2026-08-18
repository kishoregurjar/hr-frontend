"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { HIRING_QUERY_KEYS } from "../constants";
import { hiringService } from "../services";

const useAdvanceHiringRound = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => hiringService.advanceRound(payload),

    onSuccess: ({ process }) => {
      queryClient.invalidateQueries({
        queryKey: HIRING_QUERY_KEYS.detail(process.id),
      });

      queryClient.invalidateQueries({
        queryKey: HIRING_QUERY_KEYS.candidates(process.id),
      });
    },
  });
};

export default useAdvanceHiringRound;
