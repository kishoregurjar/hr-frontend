import axiosClient from "./axiosClient";

/**
 * 1. Get Current Company Profile
 * Endpoints: GET /api/v1/auth/me/companies, GET /api/v1/company/me, GET /api/v1/companies/me
 */
export const getCompanyProfile = async () => {
  let storedCompanyId =
    typeof window !== "undefined"
      ? localStorage.getItem("companyId") ||
        localStorage.getItem("active_company_id") ||
        sessionStorage.getItem("companyId")
      : null;

  // 1. Primary: GET /auth/me/companies
  try {
    const authCompRes = await axiosClient.get("/auth/me/companies");
    const payload = authCompRes?.data?.data || authCompRes?.data || authCompRes;
    const companies = payload?.companies || (Array.isArray(payload) ? payload : []);
    if (companies.length > 0 && (companies[0]?.id || companies[0]?.name)) {
      const comp = companies[0];
      if (typeof window !== "undefined") {
        if (comp.id) {
          localStorage.setItem("companyId", comp.id);
          localStorage.setItem("active_company_id", comp.id);
        }
        if (comp.name) localStorage.setItem("companyName", comp.name);
        if (comp.logoUrl || comp.logo) localStorage.setItem("companyLogo", comp.logoUrl || comp.logo);
      }
      return comp;
    }
  } catch {}

  // 2. Secondary: GET /company/me
  try {
    const res = await axiosClient.get("/company/me", {
      headers: storedCompanyId ? { "X-Company-Id": storedCompanyId } : {},
    });
    const payload = res?.data?.data || res?.data || res;
    const companyData = payload?.company || payload;
    if (companyData && (companyData.id || companyData.name)) {
      if (typeof window !== "undefined") {
        if (companyData.id) {
          localStorage.setItem("companyId", companyData.id);
          localStorage.setItem("active_company_id", companyData.id);
        }
        if (companyData.name) localStorage.setItem("companyName", companyData.name);
        if (companyData.logoUrl || companyData.logo) localStorage.setItem("companyLogo", companyData.logoUrl || companyData.logo);
      }
      return companyData;
    }
  } catch {}

  // 3. Fallback: GET /companies/me
  try {
    const res = await axiosClient.get("/companies/me", {
      headers: storedCompanyId ? { "X-Company-Id": storedCompanyId } : {},
    });
    const payload = res?.data?.data || res?.data || res;
    const companyData = payload?.company || payload;
    if (companyData && (companyData.id || companyData.name)) {
      if (typeof window !== "undefined") {
        if (companyData.id) {
          localStorage.setItem("companyId", companyData.id);
          localStorage.setItem("active_company_id", companyData.id);
        }
        if (companyData.name) localStorage.setItem("companyName", companyData.name);
        if (companyData.logoUrl || companyData.logo) localStorage.setItem("companyLogo", companyData.logoUrl || companyData.logo);
      }
      return companyData;
    }
  } catch {}

  // 4. Fallback: GET /company
  try {
    const res = await axiosClient.get("/company", {
      headers: storedCompanyId ? { "X-Company-Id": storedCompanyId } : {},
    });
    const payload = res?.data?.data || res?.data || res;
    const companyData = payload?.company || payload;
    return companyData;
  } catch (err) {
    return null;
  }
};

/**
 * 2. Update Company Profile
 * Endpoints: PATCH /api/v1/company/me, PATCH /api/v1/companies/me, PATCH /api/v1/company
 */
export const updateCompanyProfile = async (data) => {
  let storedCompanyId =
    typeof window !== "undefined"
      ? localStorage.getItem("companyId") ||
        localStorage.getItem("active_company_id")
      : null;

  const headers = storedCompanyId ? { "X-Company-Id": storedCompanyId } : {};

  try {
    const res = await axiosClient.patch("/company/me", data, { headers });
    const payload = res?.data?.data || res?.data || res;
    const companyData = payload?.company || payload;
    if (companyData?.name && typeof window !== "undefined") {
      localStorage.setItem("companyName", companyData.name);
    }
    return companyData;
  } catch {
    try {
      const res = await axiosClient.patch("/companies/me", data, { headers });
      const payload = res?.data?.data || res?.data || res;
      const companyData = payload?.company || payload;
      if (companyData?.name && typeof window !== "undefined") {
        localStorage.setItem("companyName", companyData.name);
      }
      return companyData;
    } catch {
      const res = await axiosClient.patch("/company", data, { headers });
      const payload = res?.data?.data || res?.data || res;
      const companyData = payload?.company || payload;
      if (companyData?.name && typeof window !== "undefined") {
        localStorage.setItem("companyName", companyData.name);
      }
      return companyData;
    }
  }
};

/**
 * 3. Upload Company Logo
 * POST /api/v1/companies/me/logo or POST /api/v1/company/logo
 */
export const uploadCompanyLogo = async (file) => {
  const formData = file instanceof FormData ? file : new FormData();
  if (!(file instanceof FormData)) {
    formData.append("logo", file);
  }

  let res;
  try {
    res = await axiosClient.post("/companies/me/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch {
    res = await axiosClient.post("/company/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  const payload = res?.data?.data || res?.data || res;
  const logoUrl = payload?.logoUrl || payload?.company?.logoUrl || payload?.url;

  if (logoUrl && typeof window !== "undefined") {
    localStorage.setItem("companyLogo", logoUrl);
  }

  return payload;
};

/**
 * 4. Get Members List
 * GET /api/v1/companies/me/members or GET /api/v1/company/members
 */
export const getCompanyMembers = async (params = {}) => {
  try {
    const res = await axiosClient.get("/companies/me/members", { params });
    const payload = res?.data?.data || res?.data || res;
    return payload?.members || (Array.isArray(payload) ? payload : []);
  } catch {
    try {
      const res = await axiosClient.get("/company/members", { params });
      const payload = res?.data?.data || res?.data || res;
      return payload?.members || (Array.isArray(payload) ? payload : []);
    } catch {
      return [];
    }
  }
};

/**
 * 5. Update Member Role
 * PATCH /api/v1/companies/me/members/:memberId
 */
export const updateMemberRole = async (memberId, role) => {
  try {
    const res = await axiosClient.patch(`/companies/me/members/${memberId}`, { role });
    return res?.data?.data || res?.data || res;
  } catch {
    const res = await axiosClient.patch(`/company/members/${memberId}`, { role });
    return res?.data?.data || res?.data || res;
  }
};

/**
 * 6. Remove Member
 * DELETE /api/v1/companies/me/members/:memberId
 */
export const removeMember = async (memberId) => {
  try {
    const res = await axiosClient.delete(`/companies/me/members/${memberId}`);
    return res?.data?.data || res?.data || res;
  } catch {
    const res = await axiosClient.delete(`/company/members/${memberId}`);
    return res?.data?.data || res?.data || res;
  }
};

/**
 * 7. Transfer Ownership (Only OWNER)
 * POST /api/v1/companies/me/ownership/transfer
 */
export const transferOwnership = async (memberId) => {
  try {
    const res = await axiosClient.post("/companies/me/ownership/transfer", { memberId });
    return res?.data?.data || res?.data || res;
  } catch {
    const res = await axiosClient.post("/company/ownership/transfer", { memberId });
    return res?.data?.data || res?.data || res;
  }
};

/**
 * 8. Send Team Invitation
 * POST /api/v1/companies/me/invitations or POST /api/v1/company/invitations
 */
export const sendMemberInvitation = async ({ email, role = "HR" }) => {
  try {
    const res = await axiosClient.post("/companies/me/invitations", {
      email: email.trim(),
      role,
    });
    return res?.data?.data || res?.data || res;
  } catch {
    const res = await axiosClient.post("/company/invitations", {
      email: email.trim(),
      role,
    });
    return res?.data?.data || res?.data || res;
  }
};

/**
 * 9. List Invitations
 * GET /api/v1/companies/me/invitations or GET /api/v1/company/invitations
 */
export const getCompanyInvitations = async (params = {}) => {
  try {
    const res = await axiosClient.get("/companies/me/invitations", { params });
    const payload = res?.data?.data || res?.data || res;
    return payload?.invitations || (Array.isArray(payload) ? payload : []);
  } catch {
    try {
      const res = await axiosClient.get("/company/invitations", { params });
      const payload = res?.data?.data || res?.data || res;
      return payload?.invitations || (Array.isArray(payload) ? payload : []);
    } catch {
      return [];
    }
  }
};

/**
 * 10. Revoke / Cancel Invitation
 * DELETE /api/v1/companies/me/invitations/:invitationId
 */
export const revokeInvitation = async (invitationId) => {
  try {
    const res = await axiosClient.delete(`/companies/me/invitations/${invitationId}`);
    return res?.data?.data || res?.data || res;
  } catch {
    const res = await axiosClient.delete(`/company/invitations/${invitationId}`);
    return res?.data?.data || res?.data || res;
  }
};

/**
 * 11. Accept Invitation (Invited Team Member)
 * POST /api/v1/company/invitations/accept or POST /api/v1/companies/invitations/accept
 * Payload: { token }
 */
export const acceptCompanyInvitation = async (token) => {
  try {
    const res = await axiosClient.post("/company/invitations/accept", { token });
    return res?.data?.data || res?.data || res;
  } catch (err) {
    try {
      const res = await axiosClient.post("/companies/invitations/accept", { token });
      return res?.data?.data || res?.data || res;
    } catch {
      throw err;
    }
  }
};
