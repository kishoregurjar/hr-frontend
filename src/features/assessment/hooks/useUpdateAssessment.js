"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ASSESSMENT_QUERY_KEYS } from "../constants";
import { assessmentService } from "../services";

const useUpdateAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) =>
      assessmentService.update(id, payload),

    onSuccess: (assessment) => {
      queryClient.invalidateQueries({
        queryKey: ASSESSMENT_QUERY_KEYS.all,
      });

      queryClient.setQueryData(
        ASSESSMENT_QUERY_KEYS.detail(assessment.id),
        assessment
      );
    },
  });
};

export default useUpdateAssessment;
