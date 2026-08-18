"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ASSESSMENT_QUERY_KEYS } from "../constants";
import { assessmentService } from "../services";

const useAssessmentStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) =>
      assessmentService.update(id, { status }),

    onSuccess: (assessment) => {
      queryClient.setQueryData(
        ASSESSMENT_QUERY_KEYS.detail(assessment.id),
        assessment
      );

      queryClient.invalidateQueries({
        queryKey: ASSESSMENT_QUERY_KEYS.lists(),
      });
    },
  });
};

export default useAssessmentStatusMutation;
