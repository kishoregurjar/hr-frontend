"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ASSESSMENT_QUERY_KEYS } from "../constants";
import { assessmentService } from "../services";

const useCreateAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assessmentService.create,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ASSESSMENT_QUERY_KEYS.all,
      });
    },
  });
};

export default useCreateAssessment;
