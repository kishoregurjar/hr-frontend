"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ASSESSMENT_QUERY_KEYS } from "../constants";
import { assessmentService } from "../services";

const useUpdateAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) =>
      assessmentService.update(id, payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["assessments"],
        refetchType: "all",
      });
      await queryClient.refetchQueries({
        queryKey: ["assessments"],
      });
    },
  });
};

export default useUpdateAssessment;
