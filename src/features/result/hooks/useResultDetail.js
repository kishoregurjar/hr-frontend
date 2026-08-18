"use client";

import { useQuery } from "@tanstack/react-query";

import { RESULT_QUERY_KEYS } from "../constants";
import { resultService } from "../services";

const useResultDetail = ({ assessmentId, resultId }) => {
  return useQuery({
    queryKey: RESULT_QUERY_KEYS.detail(assessmentId, resultId),

    queryFn: () => resultService.getResultById({ assessmentId, resultId }),

    enabled: Boolean(assessmentId && resultId),
  });
};

export default useResultDetail;
