"use client";

import { useQuery } from "@tanstack/react-query";

import { ATTEMPT_QUERY_KEYS } from "../constants";
import { attemptService } from "../services";

const useAttemptByAssignment = (assignmentId) => {
  return useQuery({
    queryKey: ATTEMPT_QUERY_KEYS.assignment(assignmentId),

    queryFn: () => attemptService.getByAssignment(assignmentId),

    enabled: Boolean(assignmentId),
  });
};

export default useAttemptByAssignment;
