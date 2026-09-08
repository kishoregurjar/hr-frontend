import axiosClient from "./axiosClient";

/**
 * 1. Create Company
 * POST /api/v1/companies
 * Saves company.id to localStorage as "companyId" for multi-tenant X-Company-Id header
 */
export const createCompany = async (data) => {
  const res = await axiosClient.post("/companies", data);
  const companyData = res?.data?.company || res?.company || res?.data;
  if (companyData?.id && typeof window !== "undefined") {
    localStorage.setItem("companyId", companyData.id);
    localStorage.setItem("active_company_id", companyData.id);
  }
  return res?.data || res;
};

/**
 * 2. Get Current Company Profile
 * GET /api/v1/companies/me
 */
export const getCompanyProfile = async () => {
  let storedCompanyId =
    typeof window !== "undefined"
      ? localStorage.getItem("companyId") ||
        localStorage.getItem("active_company_id") ||
        sessionStorage.getItem("companyId")
      : null;

  // If no companyId in localStorage, find the active company from DB (/admin/companies)
  if (!storedCompanyId) {
    try {
      const adminRes = await axiosClient.get("/admin/companies");
      const list = adminRes?.data?.data || adminRes?.data || adminRes;
      const companies = Array.isArray(list) ? list : list?.companies || [];
      if (companies.length > 0) {
        storedCompanyId = companies[0].id;
        if (storedCompanyId && typeof window !== "undefined") {
          localStorage.setItem("companyId", storedCompanyId);
          localStorage.setItem("active_company_id", storedCompanyId);
          if (companies[0].name) localStorage.setItem("companyName", companies[0].name);
        }
      }
    } catch {
      // ignore
    }
  }

  try {
    const res = await axiosClient.get("/companies/me", {
      headers: storedCompanyId ? { "X-Company-Id": storedCompanyId } : {},
    });
    const data = res?.data || res;
    if (data?.id && typeof window !== "undefined") {
      localStorage.setItem("companyId", data.id);
      localStorage.setItem("active_company_id", data.id);
      if (data.name) localStorage.setItem("companyName", data.name);
    }
    return data;
  } catch (err) {
    // Fallback: If /companies/me fails, try querying /admin/companies directly
    try {
      const allRes = await axiosClient.get("/admin/companies");
      const list = allRes?.data?.data || allRes?.data || allRes;
      const companies = Array.isArray(list) ? list : list?.companies || [];
      if (companies.length > 0) {
        const firstCompany = companies[0];
        if (firstCompany?.id && typeof window !== "undefined") {
          localStorage.setItem("companyId", firstCompany.id);
          localStorage.setItem("active_company_id", firstCompany.id);
          if (firstCompany.name) localStorage.setItem("companyName", firstCompany.name);
        }
        return firstCompany;
      }
    } catch {
      // ignore
    }
    throw err;
  }
};

/**
 * 3. Update Company Profile
 * PATCH /api/v1/companies/me
 */
export const updateCompanyProfile = async (data) => {
  const res = await axiosClient.patch("/companies/me", data);
  return res?.data || res;
};

/**
 * 4. Upload Company Logo
 * POST /api/v1/companies/me/logo (multipart/form-data)
 */
export const uploadCompanyLogo = async (file) => {
  const formData = new FormData();
  if (file instanceof FormData) {
    // already form data
    const res = await axiosClient.post("/companies/me/logo", file, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res?.data || res;
  }
  formData.append("logo", file);
  const res = await axiosClient.post("/companies/me/logo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res?.data || res;
};

/**
 * 5. Get Members List
 * GET /api/v1/companies/me/members?page=1&limit=20
 */
export const getCompanyMembers = async (params = {}) => {
  const res = await axiosClient.get("/companies/me/members", { params });
  return res?.data || res;
};

/**
 * 6. Update Member Role
 * PATCH /api/v1/companies/me/members/:memberId
 * role: "ADMIN" | "RECRUITER"
 */
export const updateMemberRole = async (memberId, role) => {
  const res = await axiosClient.patch(`/companies/me/members/${memberId}`, { role });
  return res?.data || res;
};

/**
 * 7. Remove Member
 * DELETE /api/v1/companies/me/members/:memberId
 */
export const removeMember = async (memberId) => {
  const res = await axiosClient.delete(`/companies/me/members/${memberId}`);
  return res?.data || res;
};

/**
 * 8. Transfer Ownership (Only OWNER)
 * POST /api/v1/companies/me/ownership/transfer
 * memberId: CompanyMember ID
 */
export const transferOwnership = async (memberId) => {
  const res = await axiosClient.post("/companies/me/ownership/transfer", { memberId });
  return res?.data || res;
};

/**
 * 9. Send Team Invitation
 * POST /api/v1/companies/me/invitations
 * { email, role: "ADMIN" | "RECRUITER" }
 */
export const sendMemberInvitation = async ({ email, role = "RECRUITER" }) => {
  const res = await axiosClient.post("/companies/me/invitations", { email, role });
  return res?.data || res;
};

/**
 * 10. List Invitations
 * GET /api/v1/companies/me/invitations?page=1&limit=20&status=PENDING
 */
export const getCompanyInvitations = async (params = {}) => {
  const res = await axiosClient.get("/companies/me/invitations", { params });
  return res?.data || res;
};

/**
 * 11. Revoke / Cancel Invitation
 * DELETE /api/v1/companies/me/invitations/:invitationId
 */
export const revokeInvitation = async (invitationId) => {
  const res = await axiosClient.delete(`/companies/me/invitations/${invitationId}`);
  return res?.data || res;
};

/**
 * 12. Accept Invitation (Invited User)
 * POST /api/v1/companies/invitations/accept
 * { token }
 */
export const acceptCompanyInvitation = async (token) => {
  const res = await axiosClient.post("/companies/invitations/accept", { token });
  return res?.data || res;
};
