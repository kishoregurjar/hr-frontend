"use client";

import { useQuery } from "@tanstack/react-query";

import { ASSIGNMENT_QUERY_KEYS } from "../constants";
import { assignmentService } from "../services";

const useAssignmentsQuery = () => {
  return useQuery({
    queryKey: ASSIGNMENT_QUERY_KEYS.lists(),
    queryFn: () => assignmentService.getAll(),
  });
};

export default useAssignmentsQuery;
