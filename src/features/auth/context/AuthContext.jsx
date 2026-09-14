"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentUserApi,
  loginApi,
  logoutApi,
  registerApi,
  clearAllAuthStorage,
  getUserCompaniesApi,
} from "@/lib/api/auth";
import { getCompanyProfile } from "@/lib/api/company";
import { AUTH_STORAGE_KEYS } from "../constants";

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    if (typeof window === "undefined") return null;
    return (
      localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN) ||
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      null
    );
  });

  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // If we already have token and user in storage, do NOT block the screen (0ms initial load)
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === "undefined") return false;
    const existingToken =
      localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN) ||
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken");
    return !existingToken;
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await getCurrentUserApi();
        if (session?.token) {
          setToken(session.token);
          let currentUser = session.user;
          const userRole = String(currentUser?.role || currentUser?.rawRole || "").toUpperCase();
          const isSuperAdmin =
            userRole === "SUPER_ADMIN" ||
            userRole === "SUPER ADMIN" ||
            currentUser?.isSuperAdmin === true;

          if (currentUser && !isSuperAdmin) {
            try {
              let compName = currentUser.companyName || currentUser.company;
              let compId = currentUser.companyId;
              let compLogo = currentUser.companyLogo;

              if (!compName || !compId) {
                try {
                  const companyData = await getCompanyProfile();
                  if (companyData && (companyData.name || companyData.id)) {
                    compName = companyData.name || compName;
                    compId = companyData.id || compId;
                    compLogo = companyData.logoUrl || compLogo;
                  }
                } catch {}
              }

              const primaryRole =
                currentUser?.activeCompany?.role ||
                currentUser?.companies?.[0]?.role ||
                currentUser?.companyRole ||
                (currentUser?.isOwner ? "OWNER" : "RECRUITER");

              if (compName || compId || primaryRole) {
                currentUser = {
                  ...currentUser,
                  company: compName || currentUser.company,
                  companyName: compName || currentUser.companyName,
                  companyId: compId || currentUser.companyId,
                  companyLogo: compLogo || currentUser.companyLogo,
                  companyRole: primaryRole,
                  isOwner: String(primaryRole).toUpperCase() === "OWNER" || Boolean(currentUser?.isOwner),
                  activeCompany: {
                    id: compId || currentUser.companyId,
                    name: compName || currentUser.companyName,
                    role: primaryRole,
                    logoUrl: compLogo || currentUser.companyLogo,
                  },
                };
                if (typeof window !== "undefined") {
                  if (compName) localStorage.setItem("companyName", compName);
                  if (compLogo) localStorage.setItem("companyLogo", compLogo);
                  if (compId) {
                    localStorage.setItem("companyId", compId);
                    localStorage.setItem("active_company_id", compId);
                  }
                  if (primaryRole) {
                    localStorage.setItem("active_company_role", primaryRole);
                    localStorage.setItem("companyRole", primaryRole);
                  }
                  localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(currentUser));
                }
              }
            } catch {}
          }
          setUser(currentUser);
        } else if (!localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN)) {
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        if (err?.response?.status === 401) {
          clearAllAuthStorage();
          setToken(null);
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    const handleProfileUpdate = () => {
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch {}
    };

    window.addEventListener("userProfileUpdated", handleProfileUpdate);
    window.addEventListener("storage", handleProfileUpdate);
    return () => {
      window.removeEventListener("userProfileUpdated", handleProfileUpdate);
      window.removeEventListener("storage", handleProfileUpdate);
    };
  }, []);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const res = await loginApi(credentials);
      setToken(res.token);
      setUser(res.user);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const res = await registerApi(userData);
      setToken(res.token);
      setUser(res.user);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutApi();
    } finally {
      clearAllAuthStorage();
      setToken(null);
      setUser(null);
      setIsLoading(false);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        isAuthenticated: Boolean(token && user),
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
