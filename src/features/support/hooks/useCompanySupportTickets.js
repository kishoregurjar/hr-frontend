"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getCompanySupportRequests } from "@/lib/api/support";
import { SUPPORT_QUERY_KEYS, SUPPORT_CACHE_CONFIG } from "../constants";

/**
 * React Query hook for fetching company support tickets with stale-while-revalidate caching.
 *
 * @param {string} companyId - Active tenant/company identifier for multi-tenant isolation
 * @param {object} params - Query params (e.g. { limit: 100, sortOrder: "desc" })
 * @param {object} options - Extra options such as { enabled: boolean }
 */
export function useCompanySupportTickets(companyId, params = {}, options = {}) {
  const normalizedParams = {
    limit: params.limit || 100,
    sortOrder: params.sortOrder || "desc",
    ...(params.status ? { status: params.status } : {}),
  };

  const isEnabled = Boolean(companyId && options.enabled !== false);

  return useQuery({
    queryKey: SUPPORT_QUERY_KEYS.companyRequests(companyId, normalizedParams),
    queryFn: async () => {
      const data = await getCompanySupportRequests(normalizedParams);
      return data || { items: [], total: 0 };
    },
    staleTime: SUPPORT_CACHE_CONFIG.STALE_TIME, // 60s freshness window
    gcTime: SUPPORT_CACHE_CONFIG.GC_TIME,       // 10m cache retention
    refetchOnMount: false,                      // Do not refetch on mount if data is fresh (< 60s)
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,          // Preserve previous data during background refetching
    enabled: isEnabled,
  });
}

export default useCompanySupportTickets;

