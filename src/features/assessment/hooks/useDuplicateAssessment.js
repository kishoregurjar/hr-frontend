"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ASSESSMENT_QUERY_KEYS } from "../constants";
import { assessmentService } from "../services";

const useDuplicateAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => assessmentService.duplicate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ASSESSMENT_QUERY_KEYS.all,
      });
    },
  });
};

export default useDuplicateAssessment;
