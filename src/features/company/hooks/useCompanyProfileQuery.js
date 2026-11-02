"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getCompanyProfile } from "@/lib/api/company";
import { COMPANY_QUERY_KEYS, COMPANY_CACHE_CONFIG } from "../constants";

/**
 * React Query hook for fetching company profile with stale-while-revalidate caching.
 *
 * @param {string} companyId - Active tenant/company identifier
 * @param {object} options - Optional config { enabled: boolean }
 */
export function useCompanyProfileQuery(companyId, options = {}) {
  const isEnabled = Boolean(companyId && options.enabled !== false);

  return useQuery({
    queryKey: COMPANY_QUERY_KEYS.profile(companyId),
    queryFn: async () => {
      const data = await getCompanyProfile();
      return data || null;
    },
    staleTime: COMPANY_CACHE_CONFIG.STALE_TIME,
    gcTime: COMPANY_CACHE_CONFIG.GC_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    enabled: isEnabled,
  });
}

export default useCompanyProfileQuery;

