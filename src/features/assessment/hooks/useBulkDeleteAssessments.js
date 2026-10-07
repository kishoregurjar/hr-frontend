"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ASSESSMENT_QUERY_KEYS } from "../constants";
import { assessmentService } from "../services";

const useBulkDeleteAssessments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids = [], all = false }) => {
      if (all) {
        return assessmentService.removeAll();
      }
      return assessmentService.bulkRemove(ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ASSESSMENT_QUERY_KEYS.all,
      });
      queryClient.refetchQueries({
        queryKey: ASSESSMENT_QUERY_KEYS.all,
      });
    },
  });
};

export default useBulkDeleteAssessments;
