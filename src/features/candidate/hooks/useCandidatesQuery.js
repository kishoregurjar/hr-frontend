"use client";

import { useQuery } from "@tanstack/react-query";

import { CANDIDATE_QUERY_KEYS } from "../constants";
import { candidateService } from "../services";

const useCandidatesQuery = () => {
  return useQuery({
    queryKey: CANDIDATE_QUERY_KEYS.lists(),
    queryFn: () => candidateService.getAll(),
  });
};

export default useCandidatesQuery;
