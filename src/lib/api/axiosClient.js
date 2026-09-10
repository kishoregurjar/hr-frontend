import axios from "axios";
import { AUTH_STORAGE_KEYS } from "@/features/auth/constants";

const rawBaseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://enjoyable-preoccupy-scowling.ngrok-free.dev/api/v1";

// In browser, using relative "/api/v1" routes through Next.js proxy rewrites which completely eliminates browser CORS errors!
const baseURL =
  typeof window !== "undefined"
    ? "/api/v1"
    : rawBaseURL.endsWith("/api/v1")
    ? rawBaseURL
    : `${rawBaseURL.replace(/\/+$/, "")}/api/v1`;

const axiosClient = axios.create({
  baseURL,
  timeout: 60000, // 60s timeout for heavy mailbox syncs & AI resume parsing
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
      const isCandidateEndpoint =
        config.url?.includes("/attempts") ||
        config.url?.includes("/invitations") ||
        config.url?.includes("/verify") ||
        config.url?.includes("/assessment-attempts");

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

      const tokenToUse = isCandidateEndpoint
        ? candidateToken || adminToken
        : adminToken || candidateToken;

      if (tokenToUse) {
        config.headers.Authorization = `Bearer ${tokenToUse}`;
      }

      // ── X-Company-Id Header for Multi-Tenant APIs ──
      const companyId =
        localStorage.getItem("companyId") ||
        localStorage.getItem("active_company_id") ||
        localStorage.getItem("hirequest_company_id") ||
        sessionStorage.getItem("companyId");

      if (
        companyId &&
        !config.headers["X-Company-Id"] &&
        !config.url?.includes("/companies/invitations/accept")
      ) {
        config.headers["X-Company-Id"] = companyId;
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

    // Check if error is token expiration (401) and not on auth endpoints
    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/refresh-token") ||
      originalRequest?.url?.includes("/verify") ||
      originalRequest?.url?.includes("/attempts/candidate") ||
      originalRequest?.url?.includes("/attempts/start-by-token") ||
      originalRequest?.url?.includes("/attempts/save-answer") ||
      originalRequest?.url?.includes("/invitations");

    const isTokenExpired = status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint;

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
          ? localStorage.getItem("hirequest_refresh_token") || localStorage.getItem("refreshToken")
          : null;

      if (!storedRefreshToken) {
        isRefreshing = false;
        processQueue(new Error("No refresh token available"), null);
        return Promise.reject(new Error("Session expired. Please log in again."));
      }

      try {
        const refreshResponse = await fetch(`${baseURL}/auth/refresh-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ refreshToken: storedRefreshToken }),
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

        if (newToken) {
          if (typeof window !== "undefined") {
            localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, newToken);
            localStorage.setItem("token", newToken);
            localStorage.setItem("accessToken", newToken);
            localStorage.setItem("jwt", newToken);
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
          localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
          localStorage.removeItem("token");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("hirequest_refresh_token");
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
