"use client";

import { useQuery } from "@tanstack/react-query";
import { CANDIDATE_QUERY_KEYS } from "../constants";
import { candidateService } from "../services";

const useCandidatesQuery = (options = {}) => {
  return useQuery({
    queryKey: CANDIDATE_QUERY_KEYS.lists(),
    queryFn: () => candidateService.getAll({ limit: 1000 }),
    staleTime: 30000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export default useCandidatesQuery;
