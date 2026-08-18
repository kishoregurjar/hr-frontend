"use client";

import { useQuery } from "@tanstack/react-query";

import { HIRING_QUERY_KEYS } from "../constants";
import { hiringService } from "../services";

const usePipelineCandidates = (hiringProcessId) => {
  return useQuery({
    queryKey: HIRING_QUERY_KEYS.candidates(hiringProcessId),

    queryFn: () => hiringService.getCandidates(hiringProcessId),

    enabled: Boolean(hiringProcessId),
  });
};

export default usePipelineCandidates;
