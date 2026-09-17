import axios from "axios";
import { AUTH_STORAGE_KEYS } from "@/features/auth/constants";

const rawBaseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://walkingdreamzhrmanagement.up.railway.app";

const cleanBaseURL = rawBaseURL
  .replace(/\/api\/v1\/?$/, "")
  .replace(/\/+$/, "");

// In browser, using relative "/api/v1" routes through Next.js proxy rewrites which completely eliminates browser CORS errors!
const baseURL =
  typeof window !== "undefined"
    ? "/api/v1"
    : `${cleanBaseURL}/api/v1`;

const axiosClient = axios.create({
  baseURL,
  timeout: 60000, // 60s timeout for heavy mailbox syncs & AI resume parsing
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

axiosClient.defaults.headers.common["ngrok-skip-browser-warning"] = "true";

axiosClient.interceptors.request.use(
  (config) => {
    config.headers["ngrok-skip-browser-warning"] = "true";
    if (typeof window !== "undefined") {
      // Specific candidate assessment test-taking endpoints (passwordless/OTP candidate session)
      const url = config.url || "";
      const isCandidateEndpoint =
        url.includes("/attempts/candidate/send-otp") ||
        url.includes("/attempts/candidate/verify-otp") ||
        url.includes("/attempts/start-by-token") ||
        url.includes("/attempts/save-answer") ||
        url.includes("/attempts/submit") ||
        url.includes("/attempts/candidate-session") ||
        url.includes("/take-test");

      const candidateToken =
        sessionStorage.getItem("candidateSessionToken") ||
        localStorage.getItem("candidateSessionToken") ||
        sessionStorage.getItem("candidateAccessToken") ||
        localStorage.getItem("candidateAccessToken");

      const adminToken =
        localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN) ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("jwt");

      // Candidate test taking endpoints use candidateToken, all HR management endpoints use adminToken
      const tokenToUse = isCandidateEndpoint
        ? candidateToken
        : adminToken || candidateToken;

      if (tokenToUse) {
        config.headers.Authorization = `Bearer ${tokenToUse}`;
      }

      // ── X-Company-Id & x-company-id Header for Multi-Tenant APIs ──
      const companyId =
        localStorage.getItem("companyId") ||
        localStorage.getItem("active_company_id") ||
        localStorage.getItem("hirequest_company_id") ||
        sessionStorage.getItem("companyId");

      const storedUserRaw = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
      let isSuperAdmin = false;
      try {
        if (storedUserRaw) {
          const u = JSON.parse(storedUserRaw);
          isSuperAdmin = u?.role === "SUPER_ADMIN" || u?.rawRole === "SUPER_ADMIN";
        }
      } catch {}

      if (
        companyId &&
        !isSuperAdmin &&
        !isCandidateEndpoint &&
        !config.url?.includes("/companies/invitations/accept") &&
        !config.url?.includes("/super-admin/") &&
        !config.url?.includes("/invitations/") &&
        !config.url?.includes("/attempts/verify")
      ) {
        config.headers["X-Company-Id"] = companyId;
        config.headers["x-company-id"] = companyId;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Production Single Token Refresh Queue ──
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Extract data and handle automatic silent token refresh
axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;
    const responseData = error?.response?.data;

    let message =
      typeof responseData?.message === "string"
        ? responseData.message
        : typeof responseData?.error === "string"
        ? responseData.error
        : responseData?.error?.message ||
          responseData?.message?.message ||
          (status === 404
            ? "No account found with this email. Please check your credentials or register first."
            : error?.message) ||
          "An error occurred while connecting to the server.";

    if (status === 404 && originalRequest?.url?.includes("/auth/login")) {
      message = "No account found with this email. Please register first or check your email.";
    }

    if (
      status === 502 ||
      status === 503 ||
      status === 504 ||
      error?.code === "ERR_BAD_RESPONSE" ||
      error?.code === "ERR_NETWORK" ||
      (typeof message === "string" && message.includes("Request failed with status code 50"))
    ) {
      message = "Server is temporarily updating. Please try again in a few seconds.";
    }

    // Skip refresh on public auth and candidate test endpoints
    const isAuthOrCandidateEndpoint =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/refresh-token") ||
      originalRequest?.url?.includes("/auth/forgot-password") ||
      originalRequest?.url?.includes("/auth/reset-password") ||
      originalRequest?.url?.includes("/auth/owner/activate") ||
      originalRequest?.url?.includes("/companies/invitations/accept") ||
      originalRequest?.url?.includes("/auth/accept-invitation") ||
      originalRequest?.url?.includes("/invitations/") ||
      originalRequest?.url?.includes("/attempts/verify") ||
      originalRequest?.url?.includes("/attempts/invitations/") ||
      originalRequest?.url?.includes("/attempts/candidate") ||
      originalRequest?.url?.includes("/attempts/start-by-token");

    const isTokenExpired = status === 401 && originalRequest && !originalRequest._retry && !isAuthOrCandidateEndpoint;

    if (isTokenExpired) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const storedRefreshToken =
        typeof window !== "undefined"
          ? localStorage.getItem("hirequest_refresh_token") ||
            localStorage.getItem("refreshToken") ||
            localStorage.getItem("hiremind_refresh_token")
          : null;

      try {
        const refreshBody = storedRefreshToken ? { refreshToken: storedRefreshToken } : {};
        const refreshResponse = await fetch(`${baseURL}/auth/refresh-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          credentials: "include",
          body: JSON.stringify(refreshBody),
        });

        if (!refreshResponse.ok) {
          throw new Error("Refresh token expired or invalid");
        }

        const refreshData = await refreshResponse.json();
        const newToken =
          refreshData?.data?.accessToken ||
          refreshData?.data?.token ||
          refreshData?.accessToken ||
          refreshData?.token;

        const newRefreshToken =
          refreshData?.data?.refreshToken ||
          refreshData?.refreshToken;

        if (newToken) {
          if (typeof window !== "undefined") {
            localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, newToken);
            localStorage.setItem("token", newToken);
            localStorage.setItem("accessToken", newToken);
            localStorage.setItem("jwt", newToken);
            if (newRefreshToken) {
              localStorage.setItem("hirequest_refresh_token", newRefreshToken);
            }
          }
          axiosClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return axiosClient(originalRequest);
        } else {
          throw new Error("Token refresh response missing access token");
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname || "";
          const isExemptFromExpiredRedirect =
            currentPath.includes("/activate-owner") ||
            currentPath.includes("/accept-invitation") ||
            currentPath.includes("/login") ||
            currentPath.includes("/register") ||
            currentPath.includes("/forgot-password") ||
            currentPath.includes("/reset-password") ||
            currentPath.includes("/verify-email") ||
            currentPath.includes("/take-test") ||
            currentPath.includes("/assessment/attempt") ||
            currentPath.includes("/test/room") ||
            currentPath.includes("/test/") ||
            currentPath.includes("/candidate/");

          if (!isExemptFromExpiredRedirect) {
            localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
            localStorage.removeItem("token");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("hirequest_refresh_token");
            window.location.href = "/login?expired=true";
          }
        }
        return Promise.reject(new Error("Session expired. Please log in again."));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
