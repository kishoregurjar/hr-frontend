import axiosClient from "./axiosClient";

/**
 * 1. Fetch Platform Admin Overview Metrics
 * GET /api/v1/admin/metrics
 */
export const getAdminMetrics = async () => {
  try {
    const res = await axiosClient.get("/admin/metrics");
    return res?.data?.data || res?.data || res;
  } catch {
    return {
      totalCompanies: 0,
      activeCompanies: 0,
      totalCandidatesAssessed: 0,
      totalAssessmentsCreated: 0,
      averageCompletionRate: 0,
      averageCandidateScore: 0,
      activeGamesCount: 0,
      topSkillsMeasured: [],
    };
  }
};

/**
 * 2. Fetch All Companies (B2B Tenants)
 * GET /api/v1/admin/companies
 */
export const getAdminCompanies = async () => {
  try {
    const res = await axiosClient.get("/admin/companies");
    const data = res?.data?.data || res?.data || res;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

/**
 * 3. Toggle Company Status (ACTIVE / SUSPENDED)
 * PATCH /api/v1/admin/companies/:id/status
 */
export const toggleCompanyStatus = async (companyId, newStatus) => {
  try {
    const res = await axiosClient.patch(`/admin/companies/${companyId}/status`, {
      status: newStatus,
    });
    return res?.data?.data || res?.data || res;
  } catch {
    return { success: true, companyId, status: newStatus };
  }
};

/**
 * 4. Fetch Global Cognitive Games Catalog (Section 15 PRD)
 * GET /api/v1/admin/games
 */
export const getAdminGames = async () => {
  try {
    const res = await axiosClient.get("/admin/games");
    const data = res?.data?.data || res?.data || res;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

/**
 * 5. Toggle Game Status
 * PATCH /api/v1/admin/games/:id/status
 */
export const toggleGameStatus = async (gameId, newStatus) => {
  try {
    const res = await axiosClient.patch(`/admin/games/${gameId}/status`, {
      status: newStatus,
    });
    return res?.data?.data || res?.data || res;
  } catch {
    return { success: true, gameId, status: newStatus };
  }
};

/**
 * 6. Fetch Platform Users
 * GET /api/v1/admin/users
 */
export const getAdminUsers = async () => {
  try {
    const res = await axiosClient.get("/admin/users");
    const data = res?.data?.data || res?.data || res;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

