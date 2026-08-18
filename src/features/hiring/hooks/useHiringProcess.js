"use client";

import { useQuery } from "@tanstack/react-query";

import { HIRING_QUERY_KEYS } from "../constants";
import { hiringService } from "../services";

const useHiringProcess = (hiringProcessId) => {
  return useQuery({
    queryKey: HIRING_QUERY_KEYS.detail(hiringProcessId),

    queryFn: () => hiringService.getProcess(hiringProcessId),

    enabled: Boolean(hiringProcessId),
  });
};

export default useHiringProcess;
