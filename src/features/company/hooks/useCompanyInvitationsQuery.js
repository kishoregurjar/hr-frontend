"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getCompanyInvitations } from "@/lib/api/company";
import { COMPANY_QUERY_KEYS, COMPANY_CACHE_CONFIG } from "../constants";

/**
 * React Query hook for fetching company recruiter invitations with stale-while-revalidate caching.
 *
 * @param {string} companyId - Active tenant/company identifier
 * @param {string} status - Filter status ('PENDING' | 'ACCEPTED' | 'ALL')
 * @param {object} options - Optional config { enabled: boolean }
 */
export function useCompanyInvitationsQuery(companyId, status = "PENDING", options = {}) {
  const isEnabled = Boolean(companyId && options.enabled !== false);
  const normalizedStatus = status || "ALL";

  return useQuery({
    queryKey: COMPANY_QUERY_KEYS.invitations(companyId, { status: normalizedStatus }),
    queryFn: async () => {
      const params = { page: 1, limit: 50 };
      if (normalizedStatus && normalizedStatus !== "ALL") {
        params.status = normalizedStatus;
      }
      const res = await getCompanyInvitations(params);
      return Array.isArray(res)
        ? res
        : res?.data?.data?.invitations ||
          res?.data?.invitations ||
          res?.invitations ||
          (Array.isArray(res?.data) ? res?.data : []);
    },
    staleTime: COMPANY_CACHE_CONFIG.STALE_TIME,
    gcTime: COMPANY_CACHE_CONFIG.GC_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    enabled: isEnabled,
  });
}

export default useCompanyInvitationsQuery;

