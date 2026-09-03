"use client";

import { useQuery } from "@tanstack/react-query";

import { ASSESSMENT_QUERY_KEYS } from "../constants";
import { assessmentService } from "../services";

const useAssessmentsQuery = (params) => {
  return useQuery({
    queryKey: ASSESSMENT_QUERY_KEYS.lists(),
    queryFn: () => assessmentService.getAll(params),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

export default useAssessmentsQuery;
