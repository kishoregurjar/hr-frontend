"use client";

import { useQuery } from "@tanstack/react-query";

import { assignmentService } from "../services";

const useInvitationQuery = (token) => {
  return useQuery({
    queryKey: ["invitation", token],
    queryFn: () => assignmentService.getByToken(token),
    enabled: Boolean(token),
    retry: false,
  });
};

export default useInvitationQuery;
