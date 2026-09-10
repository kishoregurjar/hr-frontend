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
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await getCurrentUserApi();
        setToken(session.token);
        let currentUser = session.user;
        if (session.token && currentUser && currentUser.role !== "SUPER_ADMIN") {
          try {
            let compName = currentUser.companyName || currentUser.company;
            let compId = currentUser.companyId;
            let compLogo = currentUser.companyLogo;

            // 1. Try getCompanyProfile
            try {
              const companyData = await getCompanyProfile();
              if (companyData && (companyData.name || companyData.id)) {
                compName = companyData.name || compName;
                compId = companyData.id || compId;
                compLogo = companyData.logoUrl || compLogo;
              }
            } catch {}

            // 2. Fallback: try getUserCompaniesApi
            if (!compName) {
              try {
                const userCompanies = await getUserCompaniesApi();
                if (Array.isArray(userCompanies) && userCompanies.length > 0) {
                  compName = userCompanies[0].name || compName;
                  compId = userCompanies[0].id || compId;
                  compLogo = userCompanies[0].logoUrl || compLogo;
                }
              } catch {}
            }

            if (compName || compId) {
              currentUser = {
                ...currentUser,
                company: compName || currentUser.company,
                companyName: compName || currentUser.companyName,
                companyId: compId || currentUser.companyId,
                companyLogo: compLogo || currentUser.companyLogo,
              };
              if (typeof window !== "undefined") {
                if (compName) localStorage.setItem("companyName", compName);
                if (compLogo) localStorage.setItem("companyLogo", compLogo);
                if (compId) {
                  localStorage.setItem("companyId", compId);
                  localStorage.setItem("active_company_id", compId);
                }
                localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(currentUser));
              }
            }
          } catch {}
        }
        setUser(currentUser);
      } catch {
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const res = await loginApi(credentials);
      setToken(res.token);
      let loggedUser = res.user;
      if (res.token && loggedUser && loggedUser.role !== "SUPER_ADMIN") {
        try {
          let compName = loggedUser.companyName || loggedUser.company;
          let compId = loggedUser.companyId;
          let compLogo = loggedUser.companyLogo;

          try {
            const companyData = await getCompanyProfile();
            if (companyData && (companyData.name || companyData.id)) {
              compName = companyData.name || compName;
              compId = companyData.id || compId;
              compLogo = companyData.logoUrl || compLogo;
            }
          } catch {}

          if (!compName) {
            try {
              const userCompanies = await getUserCompaniesApi();
              if (Array.isArray(userCompanies) && userCompanies.length > 0) {
                compName = userCompanies[0].name || compName;
                compId = userCompanies[0].id || compId;
                compLogo = userCompanies[0].logoUrl || compLogo;
              }
            } catch {}
          }

          if (compName || compId) {
            loggedUser = {
              ...loggedUser,
              company: compName || loggedUser.company,
              companyName: compName || loggedUser.companyName,
              companyId: compId || loggedUser.companyId,
              companyLogo: compLogo || loggedUser.companyLogo,
            };
            if (typeof window !== "undefined") {
              if (compName) localStorage.setItem("companyName", compName);
              if (compLogo) localStorage.setItem("companyLogo", compLogo);
              if (compId) {
                localStorage.setItem("companyId", compId);
                localStorage.setItem("active_company_id", compId);
              }
              localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(loggedUser));
            }
          }
        } catch {}
      }
      setUser(loggedUser);
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
