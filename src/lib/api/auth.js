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
const normalizeUser = (resData, fallbackEmail = "") => {
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

  const firstName = rawUser.firstName || rawUser.first_name || "";
  const lastName = rawUser.lastName || rawUser.last_name || "";

  let fullName =
    rawUser.fullName ||
    rawUser.full_name ||
    rawUser.name ||
    (firstName || lastName ? `${firstName} ${lastName}`.trim() : "") ||
    rawUser.username ||
    (rawUser.email ? rawUser.email.split("@")[0] : "") ||
    (fallbackEmail ? fallbackEmail.split("@")[0] : "") ||
    "User";

  const formattedName = fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

  return {
    id: rawUser.id || rawUser._id || `hr-${Date.now()}`,
    name: formattedName || "User",
    email: rawUser.email || fallbackEmail,
    company: rawUser.company || "HireQuest HR",
    role: rawUser.role || "HR",
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

  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
  }

  return { token, user };
};

/**
 * HR Register API — Live Backend Call
 * Endpoint: POST /api/v1/auth/register
 */
export const registerApi = async ({ name, email, company, password }) => {
  const parts = (name || "").trim().split(" ");
  const firstName = parts[0] || "Recruiter";
  const lastName = parts.slice(1).join(" ") || "User";

  const res = await axiosClient.post("/auth/register", {
    firstName,
    lastName,
    email,
    password,
    company,
    role: "HR",
  });

  const user = normalizeUser(res, email);

  return { user };
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

  if (!token || !storedUser) {
    return { token: null, user: null };
  }

  let parsedUser = null;
  try {
    parsedUser = JSON.parse(storedUser);
  } catch {
    parsedUser = null;
  }

  try {
    const res = await axiosClient.get("/auth/me");
    const liveUser = normalizeUser(res) || parsedUser;
    if (liveUser) {
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(liveUser));
    }
    return { token, user: liveUser || parsedUser };
  } catch {
    // Preserve persistent user session on refresh until user explicitly logs out
    return { token, user: parsedUser };
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
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
      localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    }
  }

  return { success: true };
};
