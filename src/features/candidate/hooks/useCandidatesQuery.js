"use client";

import { useQuery } from "@tanstack/react-query";

import { CANDIDATE_QUERY_KEYS } from "../constants";
import { candidateService } from "../services";

const useCandidatesQuery = () => {
  return useQuery({
    queryKey: CANDIDATE_QUERY_KEYS.lists(),
    queryFn: () => candidateService.getAll(),
    staleTime: 5000,
    refetchOnWindowFocus: true,
    refetchInterval: 15000, // Silently auto-fetch incoming email applications every 15s
  });
};

export default useCandidatesQuery;
