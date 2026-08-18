"use client";

import { useQuery } from "@tanstack/react-query";

import { ASSESSMENT_QUERY_KEYS } from "../constants";
import { assessmentService } from "../services";

const useAssessmentQuery = (id) => {
  return useQuery({
    queryKey: ASSESSMENT_QUERY_KEYS.detail(id),

    queryFn: () => assessmentService.getById(id),

    enabled: Boolean(id),
  });
};

export default useAssessmentQuery;
