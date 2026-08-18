"use client";

import { useQuery } from "@tanstack/react-query";

import { CANDIDATE_QUERY_KEYS } from "../constants";
import { candidateService } from "../services";

const useCandidateQuery = (id) => {
  return useQuery({
    queryKey: CANDIDATE_QUERY_KEYS.detail(id),
    queryFn: () => candidateService.getById(id),
    enabled: id !== undefined && id !== null && id !== "",
  });
};

export default useCandidateQuery;
