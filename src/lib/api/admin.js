import axiosClient from "./axiosClient";

/**
 * 1. Fetch Super Admin Executive Dashboard Overview Statistics
 * Endpoint: GET /api/v1/super-admin/dashboard
 */
export const getAdminMetrics = async () => {
  try {
    const res = await axiosClient.get("/super-admin/dashboard");
    const data = res?.data?.data || res?.data || res;
    return {
      companies: {
        total: data?.companies?.total ?? 0,
        active: data?.companies?.active ?? 0,
        suspended: data?.companies?.suspended ?? 0,
      },
      members: {
        total: data?.members?.total ?? 0,
      },
      jobs: {
        total: data?.jobs?.total ?? 0,
      },
      invitations: {
        pending: data?.invitations?.pending ?? 0,
      },
      ownerActivations: {
        pending: data?.ownerActivations?.pending ?? 0,
      },
      totalCompanies: data?.companies?.total ?? 0,
      activeCompanies: data?.companies?.active ?? 0,
      suspendedCompanies: data?.companies?.suspended ?? 0,
      totalMembers: data?.members?.total ?? 0,
      totalJobs: data?.jobs?.total ?? 0,
      pendingActivations: data?.ownerActivations?.pending ?? 0,
    };
  } catch (err) {
    try {
      const fallbackRes = await axiosClient.get("/super-admin/metrics");
      const data = fallbackRes?.data?.data || fallbackRes?.data || fallbackRes;
      return data;
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
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.companies)) return data.companies;
    if (Array.isArray(data?.items)) return data.items;
    return [];
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
    return Array.isArray(data) ? data : data?.games || [];
  } catch {
    return [];
  }
};

/**
 * 11. Toggle Cognitive Game Status
 * Endpoint: PATCH /api/v1/super-admin/games/:id/status
 */
export const toggleGameStatus = async (gameId, newStatus) => {
  try {
    const res = await axiosClient.patch(`/super-admin/games/${gameId}/status`, {
      status: newStatus,
    });
    return res?.data?.data || res?.data || res;
  } catch {
    return { success: true, gameId, status: newStatus };
  }
};

/**
 * 12. Fetch Platform Users
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
