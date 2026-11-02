export const COMPANY_QUERY_KEYS = {
  all: ["company"],
  profile: (companyId) => ["company", "profile", String(companyId || "default")],
  members: (companyId, params = {}) => [
    "company",
    "members",
    String(companyId || "default"),
    params,
  ],
  invitations: (companyId, params = {}) => [
    "company",
    "invitations",
    String(companyId || "default"),
    params,
  ],
};

export const COMPANY_CACHE_CONFIG = {
  STALE_TIME: 60 * 1000,    // 60 seconds freshness window
  GC_TIME: 10 * 60 * 1000,  // 10 minutes cache retention
};

