import axiosClient from "./axiosClient";

/**
 * 1. Fetch Super Admin Executive Dashboard Overview Statistics
 * Endpoint: GET /api/v1/super-admin/dashboard
 */
export const getAdminMetrics = async () => {
  try {
    const res = await axiosClient.get("/super-admin/dashboard");
    const raw = res?.data?.data || res?.data || res;
    const stats = raw?.statistics || raw;

    const totalCompanies =
      stats?.companies?.total ??
      stats?.totalCompanies ??
      0;

    const activeCompanies =
      stats?.companies?.active ??
      stats?.activeCompanies ??
      0;

    const suspendedCompanies =
      stats?.companies?.suspended ??
      stats?.suspendedCompanies ??
      0;

    const totalMembers =
      stats?.members?.total ??
      stats?.totalMembers ??
      0;

    const totalJobs =
      stats?.jobs?.total ??
      stats?.totalJobs ??
      0;

    const pendingInvitations =
      stats?.invitations?.pending ??
      stats?.pendingInvitations ??
      0;

    const pendingOwnerActivations =
      stats?.ownerActivations?.pending ??
      stats?.pendingActivations ??
      0;

    return {
      companies: {
        total: totalCompanies,
        active: activeCompanies,
        suspended: suspendedCompanies,
      },
      members: {
        total: totalMembers,
      },
      jobs: {
        total: totalJobs,
      },
      invitations: {
        pending: pendingInvitations,
      },
      ownerActivations: {
        pending: pendingOwnerActivations,
      },
      totalCompanies,
      activeCompanies,
      suspendedCompanies,
      totalMembers,
      totalJobs,
      pendingActivations: pendingOwnerActivations,
    };
  } catch (err) {
    try {
      const fallbackRes = await axiosClient.get("/super-admin/metrics");
      const fallbackRaw = fallbackRes?.data?.data || fallbackRes?.data || fallbackRes;
      const stats = fallbackRaw?.statistics || fallbackRaw;
      return {
        companies: {
          total: stats?.companies?.total ?? stats?.totalCompanies ?? 0,
          active: stats?.companies?.active ?? stats?.activeCompanies ?? 0,
          suspended: stats?.companies?.suspended ?? stats?.suspendedCompanies ?? 0,
        },
        members: { total: stats?.members?.total ?? stats?.totalMembers ?? 0 },
        jobs: { total: stats?.jobs?.total ?? stats?.totalJobs ?? 0 },
        invitations: { pending: stats?.invitations?.pending ?? stats?.pendingInvitations ?? 0 },
        ownerActivations: { pending: stats?.ownerActivations?.pending ?? stats?.pendingActivations ?? 0 },
        totalCompanies: stats?.companies?.total ?? stats?.totalCompanies ?? 0,
        activeCompanies: stats?.companies?.active ?? stats?.activeCompanies ?? 0,
        suspendedCompanies: stats?.companies?.suspended ?? stats?.suspendedCompanies ?? 0,
        totalMembers: stats?.members?.total ?? stats?.totalMembers ?? 0,
        totalJobs: stats?.jobs?.total ?? stats?.totalJobs ?? 0,
        pendingActivations: stats?.ownerActivations?.pending ?? stats?.pendingActivations ?? 0,
      };
    } catch {
      return {
        companies: { total: 0, active: 0, suspended: 0 },
        members: { total: 0 },
        jobs: { total: 0 },
        invitations: { pending: 0 },
        ownerActivations: { pending: 0 },
        totalCompanies: 0,
        activeCompanies: 0,
        suspendedCompanies: 0,
        totalMembers: 0,
        totalJobs: 0,
        pendingActivations: 0,
      };
    }
  }
};

/**
 * 2. Fetch All Companies with Pagination & Filter Support
 * Endpoint: GET /api/v1/super-admin/companies
 */
export const getAdminCompanies = async (params = {}) => {
  try {
    const res = await axiosClient.get("/super-admin/companies", { params });
    const data = res?.data?.data || res?.data || res;
    let list = [];
    if (Array.isArray(data)) list = data;
    else if (Array.isArray(data?.companies)) list = data.companies;
    else if (Array.isArray(data?.items)) list = data.items;

    return list.map((item) => ({
      ...item,
      ownerEmail: item?.owner?.email || item?.ownerEmail || item?.email || "",
      ownerName: item?.owner?.name || item?.ownerName || "",
    }));
  } catch {
    return [];
  }
};

/**
 * 3. Fetch Single Company Details
 * Endpoint: GET /api/v1/super-admin/companies/:companyId
 */
export const getAdminCompanyDetails = async (companyId) => {
  const res = await axiosClient.get(`/super-admin/companies/${companyId}`);
  const data = res?.data?.data || res?.data || res;
  return data?.company || data;
};

/**
 * 4. Fetch Company Specific Live Statistics
 * Endpoint: GET /api/v1/super-admin/companies/:companyId/statistics
 */
export const getAdminCompanyStatistics = async (companyId) => {
  try {
    const res = await axiosClient.get(`/super-admin/companies/${companyId}/statistics`);
    return res?.data?.data || res?.data || res;
  } catch {
    return null;
  }
};

/**
 * 5. Fetch Company Owner Details
 * Endpoint: GET /api/v1/super-admin/companies/:companyId/owner
 */
export const getAdminCompanyOwner = async (companyId) => {
  try {
    const res = await axiosClient.get(`/super-admin/companies/${companyId}/owner`);
    const payload = res?.data?.data || res?.data || res;
    if (payload?.owner?.owner) {
      return {
        ...payload.owner,
        ...payload.owner.owner,
        membership: payload.owner.membership,
        company: payload.owner.company,
        activation: payload.owner.activation,
      };
    }
    return payload?.owner || payload?.user || payload;
  } catch {
    return null;
  }
};

/**
 * 6. Toggle Company Status (ACTIVE / SUSPENDED)
 * Endpoint: PATCH /api/v1/super-admin/companies/:companyId/status
 */
export const toggleCompanyStatus = async (companyId, newStatus) => {
  const res = await axiosClient.patch(`/super-admin/companies/${companyId}/status`, {
    status: newStatus,
  });
  return res?.data?.data || res?.data || res;
};

/**
 * 7. Resend Owner Activation Email
 * Endpoint: POST /api/v1/super-admin/companies/:companyId/owner/resend-activation
 */
export const resendOwnerActivation = async (companyId) => {
  const res = await axiosClient.post(
    `/super-admin/companies/${companyId}/owner/resend-activation`
  );
  return res?.data?.data || res?.data || res;
};

/**
 * 8. Revoke Owner Activation Token
 * Endpoint: POST /api/v1/super-admin/companies/:companyId/owner/revoke-activation
 */
export const revokeOwnerActivation = async (companyId) => {
  const res = await axiosClient.post(
    `/super-admin/companies/${companyId}/owner/revoke-activation`
  );
  return res?.data?.data || res?.data || res;
};

/**
 * 9. Register New Client Organization (Super Admin Action)
 * Endpoint: POST /api/v1/super-admin/companies
 */
export const createAdminCompany = async (payload) => {
  const formattedWebsite = payload.domain
    ? payload.domain.startsWith("http://") || payload.domain.startsWith("https://")
      ? payload.domain
      : `https://${payload.domain}`
    : payload.website || undefined;

  const companyName = (payload.companyName || payload.name || "").trim();
  const ownerEmail = (payload.ownerEmail || payload.email || "").trim();
  const ownerName = (payload.ownerName || payload.name || "").trim() || undefined;

  const body = {
    companyName: companyName,
    name: companyName,
    website: formattedWebsite,
    domain: payload.domain || undefined,
    industry: payload.industry || "Information Technology",
    email: ownerEmail,
    ownerEmail: ownerEmail,
    ownerName: ownerName,
    plan: payload.plan || "Enterprise",
    password: payload.password || "HireQuest@2026",
  };

  try {
    const res = await axiosClient.post("/super-admin/companies", body);
    return res?.data?.data || res?.data || res;
  } catch (err) {
    const errorMsg =
      err?.response?.data?.message === "OWNER_EMAIL_ALREADY_EXISTS"
        ? "This Owner Work Email is already registered with another account. Please use a new unique email."
        : err?.response?.data?.message || err?.message || "Failed to register organization.";
    throw new Error(errorMsg);
  }
};

/**
 * 10. Fetch Global Cognitive Games Catalog
 * Endpoint: GET /api/v1/super-admin/games
 */
export const getAdminGames = async () => {
  try {
    const res = await axiosClient.get("/super-admin/games");
    const data = res?.data?.data || res?.data || res;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.games)) return data.games;
    return [];
  } catch (err) {
    console.error("Failed to fetch super-admin games:", err);
    return [];
  }
};

/**
 * 11. Toggle Cognitive Game Status
 * Endpoint: PATCH /api/v1/super-admin/games/:id/status
 */
export const toggleGameStatus = async (gameId, isActiveOrStatus) => {
  const isActive = typeof isActiveOrStatus === "boolean" 
    ? isActiveOrStatus 
    : isActiveOrStatus === "ACTIVE" || isActiveOrStatus === true;

  try {
    const res = await axiosClient.patch(`/super-admin/games/${gameId}/status`, {
      isActive,
    });
    return res?.data?.data || res?.data || res;
  } catch (err) {
    console.error(`Failed to toggle status for game ${gameId}:`, err);
    throw err;
  }
};

/**
 * 12. Fetch Games for a specific Company
 * Endpoint: GET /api/v1/super-admin/games/companies/:companyId/games
 */
export const getCompanyGames = async (companyId) => {
  try {
    const res = await axiosClient.get(`/super-admin/games/companies/${companyId}/games`);
    const data = res?.data?.data || res?.data || res;
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error(`Failed to fetch games for company ${companyId}:`, err);
    return [];
  }
};

/**
 * 13. Toggle Game Status for a specific Company
 * Endpoint: PATCH /api/v1/super-admin/games/companies/:companyId/games/:gameId/status
 */
export const toggleCompanyGameStatus = async (companyId, gameId, statusOrIsActive) => {
  const status = typeof statusOrIsActive === "boolean" 
    ? (statusOrIsActive ? "Active" : "Inactive")
    : statusOrIsActive;

  try {
    const res = await axiosClient.patch(`/super-admin/games/companies/${companyId}/games/${gameId}/status`, {
      status,
      isActive: status === "Active",
    });
    return res?.data?.data || res?.data || res;
  } catch (err) {
    console.error(`Failed to toggle company game status:`, err);
    throw err;
  }
};

/**
 * 14. Bulk Toggle Game Status for Multiple Companies
 * Endpoint: PATCH /api/v1/super-admin/games/companies/bulk/status
 */
export const bulkToggleCompanyGameStatus = async (companyIds, gameId, statusOrIsActive) => {
  const status = typeof statusOrIsActive === "boolean"
    ? (statusOrIsActive ? "Active" : "Inactive")
    : statusOrIsActive;

  try {
    const res = await axiosClient.patch("/super-admin/games/companies/bulk/status", {
      companyIds,
      gameId,
      status,
      isActive: status === "Active",
    });
    return res?.data?.data || res?.data || res;
  } catch (err) {
    console.error("Failed to bulk toggle company game status:", err);
    throw err;
  }
};

/**
 * 15. Fetch Platform Users
 * Endpoint: GET /api/v1/super-admin/users
 */
export const getAdminUsers = async () => {
  try {
    const res = await axiosClient.get("/super-admin/users");
    const data = res?.data?.data || res?.data || res;
    return Array.isArray(data) ? data : data?.users || [];
  } catch {
    return [];
  }
};

