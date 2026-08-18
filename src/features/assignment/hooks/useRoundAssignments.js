"use client";

import { useQuery } from "@tanstack/react-query";

import { ASSIGNMENT_QUERY_KEYS } from "../constants";
import { assignmentService } from "../services";

const useRoundAssignments = ({ hiringProcessId, roundId }) => {
  return useQuery({
    queryKey: ASSIGNMENT_QUERY_KEYS.round(hiringProcessId, roundId),

    queryFn: () =>
      assignmentService.getRoundAssignments({
        hiringProcessId,
        roundId,
      }),

    enabled: Boolean(hiringProcessId && roundId),
  });
};

export default useRoundAssignments;
