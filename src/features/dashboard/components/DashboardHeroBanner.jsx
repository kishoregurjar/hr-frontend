"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/context";

const DashboardHeroBanner = () => {
  const { user } = useAuth();
  const [impersonated, setImpersonated] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("hq_impersonated_company");
      if (stored) setImpersonated(JSON.parse(stored));
    } catch {}
  }, []);

  const companyName =
    impersonated?.name ||
    user?.companyName ||
    user?.company?.name ||
    user?.company ||
    (typeof window !== "undefined" ? localStorage.getItem("companyName") : null) ||
    "";

  const rawName =
    (typeof user?.name === "string" ? user.name : "") ||
    (typeof user?.fullName === "string" ? user.fullName : "") ||
    (user?.email ? user.email.split("@")[0] : "");
  const userName = String(rawName).replace(/\s+user$/i, "").trim();

  const userEmail =
    (typeof user?.email === "string" && user.email) ||
    (typeof window !== "undefined" ? localStorage.getItem("user_email") : null) ||
    "";

  const activeCompanyRole =
    user?.activeCompany?.role ||
    user?.companies?.[0]?.role ||
    user?.companyRole ||
    (user?.isOwner ? "OWNER" : "") ||
    user?.role ||
    "";

  const isOwner = Boolean(
    user?.isOwner ||
    String(activeCompanyRole).toUpperCase() === "OWNER" ||
    String(activeCompanyRole).toUpperCase() === "COMPANY_OWNER" ||
    user?.companyRole === "OWNER" ||
    user?.role === "Company Owner"
  );

  const isAdmin = Boolean(
    user?.isAdmin ||
    String(activeCompanyRole).toUpperCase() === "ADMIN" ||
    String(activeCompanyRole).toUpperCase() === "COMPANY_ADMIN" ||
    user?.companyRole === "ADMIN" ||
    user?.role === "HR Admin"
  );

  const badgeText = isOwner
    ? "OWNER"
    : isAdmin
    ? "ADMIN"
    : "RECRUITER";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-slate-900 via-blue-950 to-indigo-950 p-5 sm:p-6 text-white shadow-lg border border-slate-800">
      {/* Background ambient lighting accents */}
      <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute left-1/4 bottom-0 h-40 w-40 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
            Automated Candidate Screening Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium">
            Deploy multi-module cognitive assessments, manage candidate pipelines, and shortlist top talent.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeroBanner;

