"use client";

import { useQuery } from "@tanstack/react-query";

import { invitationService } from "../services";

const useInvitationQuery = (token) => {
  return useQuery({
    queryKey: ["assessment-invitation", token],

    queryFn: () => invitationService.getByToken(token),

    enabled: Boolean(token),

    retry: false,
  });
};

export default useInvitationQuery;
