"use client";

import { useMemo } from "react";

import useAssignmentsQuery from "./useAssignmentsQuery";

const useCandidateAssignments = (candidateId) => {
  const query = useAssignmentsQuery();

  const assignments = useMemo(() => {
    return (query.data ?? []).filter(
      (assignment) => String(assignment.candidateId) === String(candidateId)
    );
  }, [query.data, candidateId]);

  return {
    ...query,
    data: assignments,
  };
};

export default useCandidateAssignments;
