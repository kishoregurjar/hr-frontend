import axios from "axios";
import { AUTH_STORAGE_KEYS } from "@/features/auth/constants";

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

const axiosClient = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

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
        ? (candidateToken || adminToken)
        : (adminToken || candidateToken);

      if (tokenToUse) {
        config.headers.Authorization = `Bearer ${tokenToUse}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Production-Grade Silent Token Refresh Queue
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
    const originalRequest = error.config;
    const status = error.response?.status;
    const responseData = error.response?.data;
    const message =
      typeof responseData?.message === "string"
        ? responseData.message
        : typeof responseData?.error === "string"
        ? responseData.error
        : responseData?.error?.message ||
          responseData?.message?.message ||
          error.message ||
          "An error occurred while connecting to the server.";

    // Check if error is token expiration (401) and not on auth endpoints
    const isTokenExpired =
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/register") &&
      !originalRequest.url?.includes("/auth/refresh-token") &&
      !originalRequest.url?.includes("/verify") &&
      !originalRequest.url?.includes("/attempts/candidate") &&
      !originalRequest.url?.includes("/attempts/start-by-token") &&
      !originalRequest.url?.includes("/attempts/save-answer") &&
      !originalRequest.url?.includes("/invitations");

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

      try {
        const storedRefreshToken =
          typeof window !== "undefined" ? localStorage.getItem("hirequest_refresh_token") : null;

        const refreshResponse = await fetch(`${baseURL}/auth/refresh-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ refreshToken: storedRefreshToken }),
        });

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
          processQueue(new Error("Token refresh failed"), null);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
