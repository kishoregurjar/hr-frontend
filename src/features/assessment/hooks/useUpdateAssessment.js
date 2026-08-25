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
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "assessments",
      });
    },
  });
};

export default useUpdateAssessment;
