"use client";

import { useQuery } from "@tanstack/react-query";

import { ATTEMPT_QUERY_KEYS } from "../constants";
import { attemptService } from "../services";

const useAttemptQuery = (attemptId) => {
  return useQuery({
    queryKey: ATTEMPT_QUERY_KEYS.detail(attemptId),

    queryFn: () => attemptService.getById(attemptId),

    enabled: Boolean(attemptId),

    retry: false,
  });
};

export default useAttemptQuery;
