"use client";

import { useQuery } from "@tanstack/react-query";

import { RESULT_QUERY_KEYS } from "../constants";
import { resultService } from "../services";

const useAssessmentResultSummary = (assessmentId) => {
  return useQuery({
    queryKey: RESULT_QUERY_KEYS.summary(assessmentId),

    queryFn: () => resultService.getAssessmentResultSummary(assessmentId),

    enabled: Boolean(assessmentId),
  });
};

export default useAssessmentResultSummary;
