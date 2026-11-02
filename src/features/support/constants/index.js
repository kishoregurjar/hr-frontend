export const SUPPORT_QUERY_KEYS = {
  all: ["support-tickets"],
  company: (companyId) => ["support-tickets", "company", String(companyId || "default")],
  companyRequests: (companyId, params = {}) => [
    "support-tickets",
    "company",
    String(companyId || "default"),
    "requests",
    params,
  ],
  myRequests: (userId, params = {}) => [
    "support-tickets",
    "my",
    String(userId || "me"),
    params,
  ],
  detail: (requestId) => ["support-tickets", "detail", String(requestId)],
};

export const SUPPORT_CACHE_CONFIG = {
  STALE_TIME: 60 * 1000,       // 60 seconds freshness window
  GC_TIME: 10 * 60 * 1000,     // 10 minutes garbage collection (replaces cacheTime in v5)
};

