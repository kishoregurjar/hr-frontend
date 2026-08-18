"use client";

import { useQuery } from "@tanstack/react-query";

import { ASSIGNMENT_QUERY_KEYS } from "../constants";
import { assignmentService } from "../services";

const useAssignmentByToken = (token) => {
  return useQuery({
    queryKey: ASSIGNMENT_QUERY_KEYS.token(token),

    queryFn: () => assignmentService.getByToken(token),

    enabled: Boolean(token),

    retry: false,
  });
};

export default useAssignmentByToken;
