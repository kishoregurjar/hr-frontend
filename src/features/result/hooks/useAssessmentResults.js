"use client";

import { useQuery } from "@tanstack/react-query";

import { RESULT_QUERY_KEYS } from "../constants";
import { resultService } from "../services";

const useAssessmentResults = (assessmentId) => {
  return useQuery({
    queryKey: RESULT_QUERY_KEYS.assessment(assessmentId),

    queryFn: () => resultService.getAssessmentResults(assessmentId),

    enabled: Boolean(assessmentId),
  });
};

export default useAssessmentResults;
