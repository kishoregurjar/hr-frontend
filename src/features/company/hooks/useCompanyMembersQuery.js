"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getCompanyMembers } from "@/lib/api/company";
import { COMPANY_QUERY_KEYS, COMPANY_CACHE_CONFIG } from "../constants";

/**
 * React Query hook for fetching company team members with stale-while-revalidate caching.
 *
 * @param {string} companyId - Active tenant/company identifier
 * @param {object} params - Pagination params (default: { page: 1, limit: 50 })
 * @param {object} options - Optional config { enabled: boolean }
 */
export function useCompanyMembersQuery(companyId, params = {}, options = {}) {
  const normalizedParams = {
    page: 1,
    limit: 50,
    ...params,
  };

  const isEnabled = Boolean(companyId && options.enabled !== false);

  return useQuery({
    queryKey: COMPANY_QUERY_KEYS.members(companyId, normalizedParams),
    queryFn: async () => {
      const res = await getCompanyMembers(normalizedParams);
      return Array.isArray(res)
        ? res
        : res?.data?.data?.members ||
          res?.data?.members ||
          res?.members ||
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

export default useCompanyMembersQuery;

