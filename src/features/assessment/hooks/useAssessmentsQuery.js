"use client";

import { useQuery } from "@tanstack/react-query";
import { ASSESSMENT_QUERY_KEYS } from "../constants";
import { assessmentService } from "../services";

const useAssessmentsQuery = (params, options = {}) => {
  return useQuery({
    queryKey: ASSESSMENT_QUERY_KEYS.lists(params),
    queryFn: () => assessmentService.getAll(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export default useAssessmentsQuery;
