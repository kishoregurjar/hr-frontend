import axiosClient from "./axiosClient";
import { AUTH_STORAGE_KEYS } from "@/features/auth/constants";

/**
 * Helper to extract payload object from backend response (supports both res.message and res.data)
 */
const getPayload = (res) => {
  if (res?.message && typeof res.message === "object") {
    return res.message;
  }
  if (res?.data && typeof res.data === "object") {
    return res.data;
  }
  return res || {};
};

/**
 * Helper to normalize backend user response into consistent frontend HR user object
 */
export const normalizeUser = (resData, fallbackEmail = "") => {
  const payload = getPayload(resData);

  const rawUser =
    payload?.user?.user ||
    payload?.user ||
    resData?.data?.user?.user ||
    resData?.data?.user ||
    resData?.user?.user ||
    resData?.user ||
    resData;

  if (!rawUser || typeof rawUser !== "object") {
    return null;
  }

  const firstName = (rawUser.firstName || rawUser.first_name || "").trim();
  let lastName = (rawUser.lastName || rawUser.last_name || "").trim();

  // If lastName is just the placeholder "User" or "Recruiter", don't append it
  if (lastName.toLowerCase() === "user" || lastName.toLowerCase() === "recruiter") {
    lastName = "";
  }

  let fullName = "";
  if (typeof rawUser.fullName === "string" && rawUser.fullName.trim()) {
    fullName = rawUser.fullName.trim();
  } else if (typeof rawUser.full_name === "string" && rawUser.full_name.trim()) {
    fullName = rawUser.full_name.trim();
  } else if (typeof rawUser.name === "string" && rawUser.name.trim()) {
    fullName = rawUser.name.trim();
  } else if (firstName || lastName) {
    fullName = `${firstName} ${lastName}`.trim();
  }

  if (fullName.toLowerCase() === "hr" || fullName.toLowerCase() === "user" || !fullName) {
    if (rawUser.owner?.name) {
      fullName = rawUser.owner.name;
    } else if (typeof rawUser.email === "string" && rawUser.email.includes("@")) {
      fullName = rawUser.email.split("@")[0].replace(/[0-9_.-]/g, " ").trim();
    }
  }

  if (/\s+user$/i.test(fullName)) {
    fullName = fullName.replace(/\s+user$/i, "").trim();
  }

  const formattedName =
    fullName
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ") || (email ? email.split("@")[0] : "Team Member");

  const primaryCompany =
    (Array.isArray(payload?.companies) && payload.companies[0]) ||
    (Array.isArray(resData?.data?.companies) && resData.data.companies[0]) ||
    (Array.isArray(resData?.companies) && resData.companies[0]) ||
    (Array.isArray(rawUser?.companies) && rawUser.companies[0]) ||
    (Array.isArray(rawUser?.companyMembers) && rawUser.companyMembers[0]?.company) ||
    (Array.isArray(rawUser?.memberships) && rawUser.memberships[0]?.company) ||
    (payload?.company && typeof payload.company === "object" ? payload.company : null) ||
    (resData?.data?.company && typeof resData.data.company === "object" ? resData.data.company : null) ||
    null;

  const companyObj =
    primaryCompany ||
    rawUser.company ||
    payload?.company ||
    resData?.data?.company ||
    resData?.company ||
    rawUser.organization ||
    payload?.organization ||
    null;

  let companyName = "";
  let companyId = "";
  let companyLogo = "";

  if (companyObj && typeof companyObj === "object") {
    companyName = companyObj.name || companyObj.companyName || "";
    companyId = companyObj.id || companyObj._id || companyObj.companyId || "";
    companyLogo = companyObj.logoUrl || companyObj.logo || "";
  } else if (typeof rawUser.company === "string") {
    companyName = rawUser.company;
  } else if (typeof payload?.companyName === "string") {
    companyName = payload.companyName;
  }

  if (!companyId) {
    companyId = rawUser.companyId || payload?.companyId || rawUser.tenantId || "";
  }

  const email =
    rawUser.email ||
    rawUser.user?.email ||
    payload?.user?.email ||
    payload?.email ||
    resData?.data?.email ||
    fallbackEmail ||
    (typeof window !== "undefined" ? localStorage.getItem("user_email") || "" : "");

  const explicitCompanyRole =
    primaryCompany?.role ||
    rawUser?.activeCompany?.role ||
    payload?.activeCompany?.role ||
    resData?.activeCompany?.role ||
    rawUser?.companyMember?.role ||
    rawUser?.companyMembers?.[0]?.role ||
    rawUser?.memberships?.[0]?.role ||
    companyObj?.role ||
    rawUser?.companyRole ||
    (rawUser?.role && rawUser.role !== "HR" ? rawUser.role : null) ||
    "RECRUITER";

  let companyRole = String(explicitCompanyRole).toUpperCase().trim();

  // OWNER is true if explicitly OWNER / COMPANY_OWNER or rawUser.isOwner is true
  const isOwner =
    companyRole === "OWNER" ||
    companyRole === "COMPANY_OWNER" ||
    primaryCompany?.role === "OWNER" ||
    rawUser?.isOwner === true;

  const isAdmin =
    companyRole === "ADMIN" ||
    companyRole === "COMPANY_ADMIN" ||
    primaryCompany?.role === "ADMIN" ||
    rawUser?.isAdmin === true;

  const displayRole = isOwner
    ? "Company Owner"
    : isAdmin
    ? "HR Admin"
    : companyRole === "SUPER_ADMIN"
    ? "Super Admin"
    : "Recruiter";

  return {
    id: rawUser.id || rawUser._id || `user-${Date.now()}`,
    name: formattedName,
    fullName: formattedName,
    email: email,
    company: companyName || "",
    companyName: companyName || "",
    companyId: companyId || "",
    companyLogo: companyLogo || "",
    companyRole: isOwner ? "OWNER" : isAdmin ? "ADMIN" : "RECRUITER",
    role: displayRole,
    rawRole: companyRole,
    isOwner: isOwner,
    isAdmin: isAdmin,
    activeCompany: {
      id: companyId,
      name: companyName,
      role: isOwner ? "OWNER" : isAdmin ? "ADMIN" : "RECRUITER",
      logoUrl: companyLogo,
    },
    companies: Array.isArray(payload?.companies)
      ? payload.companies
      : Array.isArray(resData?.companies)
      ? resData.companies
      : primaryCompany
      ? [primaryCompany]
      : [],
  };
};

/**
 * HR Login API — Live Backend Call
 * Endpoint: POST /api/v1/auth/login
 */
export const loginApi = async ({ email, password }) => {
  const res = await axiosClient.post("/auth/login", { email, password });

  const payload = getPayload(res);

  // Extract live access token from res.message or res.data
  const token =
    payload?.accessToken ||
    payload?.token ||
    res?.accessToken ||
    res?.data?.accessToken ||
    res?.token;

  const user = normalizeUser(res, email);

  if (!token || !user) {
    throw new Error("Invalid authentication payload received from server.");
  }

  const refreshToken =
    payload?.refreshToken ||
    res?.refreshToken ||
    res?.data?.refreshToken ||
    payload?.data?.refreshToken;

  setAuthSession(token, user, refreshToken);

  return { token, user };
};

/**
 * Refresh Access Token API — Live Backend Call
 * Endpoint: POST /api/v1/auth/refresh-token
 */
export const refreshTokenApi = async () => {
  const refreshToken = typeof window !== "undefined" ? localStorage.getItem("hirequest_refresh_token") : null;
  const res = await axiosClient.post("/auth/refresh-token", { refreshToken });
  const payload = getPayload(res);
  const newToken = payload?.accessToken || payload?.token || res?.accessToken || res?.data?.accessToken || res?.token;
  if (newToken && typeof window !== "undefined") {
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, newToken);
    localStorage.setItem("token", newToken);
    localStorage.setItem("accessToken", newToken);
    localStorage.setItem("jwt", newToken);
  }
  return newToken;
};

/**
 * HR Register API — Live Backend Call
 * Endpoint: POST /api/v1/auth/register
 */
export const registerApi = async ({ firstName, lastName, name, email, company, password }) => {
  let fName = (firstName || "").trim();
  let lName = (lastName || "").trim();
  if (!fName && name) {
    const parts = (name || "").trim().split(" ");
    fName = parts[0] || "Recruiter";
    lName = parts.slice(1).join(" ").trim();
  }

  const res = await axiosClient.post("/auth/register", {
    firstName: fName || "Recruiter",
    lastName: lName || "",
    email: (email || "").trim(),
    password,
    company: company || undefined,
    role: "RECRUITER",
  });

  const payload = getPayload(res);
  const token =
    payload?.accessToken ||
    payload?.token ||
    res?.accessToken ||
    res?.data?.accessToken ||
    res?.token;

  const user = normalizeUser(res, email);
  const refreshToken = payload?.refreshToken || res?.refreshToken || res?.data?.refreshToken;

  if (token && typeof window !== "undefined") {
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
    localStorage.setItem("token", token);
    localStorage.setItem("accessToken", token);
    localStorage.setItem("jwt", token);
    if (refreshToken) {
      localStorage.setItem("hirequest_refresh_token", refreshToken);
    }
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
    }
  }

  return { token, user };
};

/**
 * Fetch Current Authenticated HR Profile — Persistent Refresh Logic
 * Endpoint: GET /api/v1/auth/me
 */
export const getCurrentUserApi = async () => {
  if (typeof window === "undefined") {
    return { token: null, user: null };
  }

  const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
  const storedUser = localStorage.getItem(AUTH_STORAGE_KEYS.USER);

  if (!token) {
    return { token: null, user: null };
  }

  let parsedUser = null;
  try {
    if (storedUser) {
      parsedUser = JSON.parse(storedUser);
      if (parsedUser?.name && /\s+user$/i.test(parsedUser.name)) {
        parsedUser.name = parsedUser.name.replace(/\s+user$/i, "").trim();
        localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(parsedUser));
      }
    }
  } catch {
    parsedUser = null;
  }

  try {
    const userRoleStr = String(parsedUser?.role || parsedUser?.rawRole || "").toUpperCase();
    const isSuperAdmin =
      userRoleStr === "SUPER_ADMIN" ||
      userRoleStr === "SUPER ADMIN" ||
      parsedUser?.isSuperAdmin === true;

    // For Super Admin or fast session check, fetch /auth/me
    const meRes = await axiosClient.get("/auth/me", { timeout: 8000 });
    const meData = meRes?.data?.data || meRes?.data || meRes;

    const liveRoleStr = String(
      meData?.user?.role || meData?.role || meData?.user?.rawRole || userRoleStr
    ).toUpperCase();
    const isSuperAdminUser =
      isSuperAdmin ||
      liveRoleStr === "SUPER_ADMIN" ||
      liveRoleStr === "SUPER ADMIN" ||
      meData?.user?.isSuperAdmin === true;

    let combinedPayload = { ...(meData || {}) };

    // Only query company endpoints for non-superadmin users if companies are missing
    if (!isSuperAdminUser && !combinedPayload?.companies && !combinedPayload?.company) {
      try {
        const [compRes, profileRes] = await Promise.allSettled([
          axiosClient.get("/auth/me/companies", { timeout: 5000 }),
          axiosClient.get("/companies/me", { timeout: 5000 }),
        ]);

        const compData = compRes.status === "fulfilled" ? compRes.value : null;
        const profileData = profileRes.status === "fulfilled" ? profileRes.value : null;

        const companies =
          compData?.data?.data?.companies ||
          compData?.data?.companies ||
          (Array.isArray(compData?.data) ? compData.data : []);

        const singleCompany =
          profileData?.data?.data?.company ||
          profileData?.data?.data ||
          profileData?.data?.company ||
          profileData?.data ||
          null;

        combinedPayload.companies = companies;
        combinedPayload.company = singleCompany;
      } catch {}
    }

    const liveUser = normalizeUser(combinedPayload) || parsedUser;

    if (liveUser) {
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(liveUser));
      if (liveUser.companyId) {
        localStorage.setItem("companyId", liveUser.companyId);
        localStorage.setItem("active_company_id", liveUser.companyId);
      }
      if (liveUser.companyName || liveUser.company) {
        localStorage.setItem("companyName", liveUser.companyName || liveUser.company);
      }
      if (liveUser.companyLogo) {
        localStorage.setItem("companyLogo", liveUser.companyLogo);
      } else {
        localStorage.removeItem("companyLogo");
      }
      if (liveUser.companyRole) {
        localStorage.setItem("active_company_role", liveUser.companyRole);
        localStorage.setItem("companyRole", liveUser.companyRole);
      }
    }

    return { token, user: liveUser || parsedUser };
  } catch {
    // Preserve persistent user session on refresh until user explicitly logs out
    return { token, user: parsedUser };
  }
};

/**
 * Comprehensive Auth Storage Cleanup Helper
 */
export const clearAllAuthStorage = () => {
  if (typeof window === "undefined") return;

  const keysToRemove = [
    AUTH_STORAGE_KEYS.TOKEN,
    AUTH_STORAGE_KEYS.USER,
    "token",
    "accessToken",
    "jwt",
    "hiremind_access_token",
    "hiremind_refresh_token",
    "hirequest_refresh_token",
    "refreshToken",
    "companyId",
    "active_company_id",
    "companyName",
    "companyLogo",
    "companyRole",
    "active_company_role",
    "hirequest_company_id",
    "hq_impersonated_company",
    "candidateSessionToken",
    "candidateAccessToken",
    "cached_admin_companies",
    "cached_admin_metrics",
    "user_email",
    "hirequest_attempts_cache",
    "invitationToken",
  ];

  keysToRemove.forEach((key) => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch {}
  });

  try {
    sessionStorage.clear();
  } catch {}
};

/**
 * Single Source of Truth Auth Session Manager
 * Saves primary keys (hirequest_token & hirequest_user) and purges redundant duplicate keys.
 */
export const setAuthSession = (token, user, refreshToken = null) => {
  if (typeof window === "undefined") return;

  // 1. Purge legacy duplicate keys from storage
  const legacyKeys = [
    "token",
    "accessToken",
    "jwt",
    "hiremind_access_token",
    "hiremind_refresh_token",
    "refreshToken",
    "hirequest_refresh_token",
    "active_company_id",
    "active_company_role",
    "companyRole",
    "hirequest_company_id",
  ];

  legacyKeys.forEach((key) => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch {}
  });

  // 2. Store primary canonical keys
  if (token) {
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
  }

  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
    const compId = user.companyId || user.activeCompany?.id;
    const compName = user.companyName || user.company || user.activeCompany?.name;
    const compLogo = user.companyLogo || user.activeCompany?.logoUrl;

    if (compId) localStorage.setItem("companyId", compId);
    if (compName) localStorage.setItem("companyName", compName);
    if (compLogo) localStorage.setItem("companyLogo", compLogo);
  }

  if (refreshToken) {
    localStorage.setItem("hirequest_refresh_token", refreshToken);
  }
};

/**
 * HR Logout API — Live Backend Call
 * Endpoint: POST /api/v1/auth/logout
 */
export const logoutApi = async () => {
  try {
    await axiosClient.post("/auth/logout");
  } catch {
    // Ignore logout error if session already expired
  } finally {
    clearAllAuthStorage();
  }

  return { success: true };
};

/**
 * Forgot Password API — Live Backend Call
 * Endpoint: POST /api/v1/auth/forgot-password
 */
export const forgotPasswordApi = async (email) => {
  const res = await axiosClient.post("/auth/forgot-password", { email });
  return res?.data?.data || res?.data || res;
};

/**
 * Reset Password API — Live Backend Call
 * Endpoint: POST /api/v1/auth/reset-password
 */
export const resetPasswordApi = async ({ token, newPassword, password }) => {
  const res = await axiosClient.post("/auth/reset-password", {
    token,
    newPassword: newPassword || password,
    password: newPassword || password,
  });
  return res?.data?.data || res?.data || res;
};

/**
 * Change Password API — Live Backend Call
 * Endpoint: POST /api/v1/auth/change-password
 */
export const changePasswordApi = async ({ currentPassword, newPassword }) => {
  const res = await axiosClient.post("/auth/change-password", {
    currentPassword,
    newPassword,
  });
  return res?.data?.data || res?.data || res;
};

/**
 * Logout All Devices API — Live Backend Call
 * Endpoint: POST /api/v1/auth/logout-all
 */
export const logoutAllApi = async () => {
  try {
    await axiosClient.post("/auth/logout-all");
  } catch {
    // Ignore error
  } finally {
    clearAllAuthStorage();
  }
  return { success: true };
};

/**
 * Owner Account Activation API — Public Guest Call
 * Endpoint: POST /api/v1/auth/owner/activate
 * Payload: { token: string, password: string }
 */
export const activateOwnerApi = async ({ token, password }) => {
  const res = await axiosClient.post("/auth/owner/activate", {
    token,
    password,
  });
  const data = res?.data?.data || res?.data || res;
  const refreshToken = data?.refreshToken || res?.refreshToken || res?.data?.refreshToken;
  const accessToken = data?.accessToken || data?.token || res?.accessToken;
  const user = normalizeUser(res);

  setAuthSession(accessToken, user, refreshToken);
  return data;
};

/**
 * Fetch Companies for Logged-In User
 * Endpoint: GET /api/v1/auth/companies or GET /api/v1/auth/me/companies
 */
export const getUserCompaniesApi = async () => {
  try {
    const res = await axiosClient.get("/auth/companies");
    const payload = res?.data?.data || res?.data || res;
    return payload?.companies || (Array.isArray(payload) ? payload : []);
  } catch {
    try {
      const res = await axiosClient.get("/auth/me/companies");
      const payload = res?.data?.data || res?.data || res;
      return payload?.companies || (Array.isArray(payload) ? payload : []);
    } catch {
      return [];
    }
  }
};

/**
 * Update User Profile (e.g., Full Name)
 * Endpoint: PATCH /api/v1/auth/profile
 */
export const updateUserProfileApi = async ({ name }) => {
  const res = await axiosClient.patch("/auth/profile", { name });
  const payload = res?.data?.data || res?.data || res;
  const user = normalizeUser(payload);

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
      let updatedUser = user;
      if (stored) {
        const prev = JSON.parse(stored);
        updatedUser = {
          ...prev,
          ...(user || {}),
          name: name.trim(),
          fullName: name.trim(),
        };
      }
      if (updatedUser) {
        localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      }
    } catch {}
    window.dispatchEvent(new Event("userProfileUpdated"));
  }
  return user || payload?.user;
};


