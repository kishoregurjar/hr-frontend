"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ASSESSMENT_QUERY_KEYS } from "../constants";
import { assessmentService } from "../services";

const useAssessmentStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, action }) => {
      const normalizedStatus = String(status || action || "").toLowerCase();

      if (action === "publish" || normalizedStatus === "published") {
        return assessmentService.publish(id);
      }
      if (action === "unpublish" || normalizedStatus === "draft") {
        return assessmentService.unpublish(id);
      }
      if (action === "archive" || normalizedStatus === "archived") {
        return assessmentService.archive(id);
      }
      if (action === "restore") {
        return assessmentService.restore(id);
      }
      if (action === "activate") {
        return assessmentService.activate(id);
      }

      return assessmentService.update(id, { status });
    },

    onSuccess: (assessment, variables) => {
      queryClient.invalidateQueries({
        queryKey: ASSESSMENT_QUERY_KEYS.all,
      });

      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: ASSESSMENT_QUERY_KEYS.detail(variables.id),
        });
      }
    },
  });
};

export default useAssessmentStatusMutation;
