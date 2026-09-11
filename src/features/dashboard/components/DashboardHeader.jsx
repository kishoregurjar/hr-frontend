"use client";

import { useAuth } from "@/features/auth/context";
import { Building2, Crown, Mail, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const DashboardHeader = () => {
  const { user } = useAuth();

  const companyName =
    user?.companyName ||
    user?.company?.name ||
    user?.company ||
    (typeof window !== "undefined" ? localStorage.getItem("companyName") : null) ||
    "";

  const companyLogo =
    user?.companyLogo ||
    (typeof window !== "undefined" ? localStorage.getItem("companyLogo") : null) ||
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
    (typeof window !== "undefined" ? localStorage.getItem("active_company_role") || localStorage.getItem("companyRole") : "") ||
    user?.role ||
    "";

  const isOwner = Boolean(
    user?.isOwner ||
    String(activeCompanyRole).toUpperCase() === "OWNER" ||
    String(activeCompanyRole).toUpperCase() === "COMPANY_OWNER" ||
    user?.companyRole === "OWNER" ||
    user?.role === "Company Owner"
  );
  const userRole = isOwner ? "Company Owner" : user?.role || "Recruiter";

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-2 border-b border-slate-100">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Recruitment Analytics & Screening
          </h1>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live System
          </span>
        </div>
        <p className="text-xs text-muted-foreground font-medium mt-1">
          Monitor candidate assessments, pipeline throughput, and score distributions in real time.
        </p>
      </div>

      {/* ── Organization & User Identity Card ── */}
      {isOwner ? (
        <Link
          href="/company"
          className="group flex items-center gap-3 p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-md transition-all duration-200"
          title="Manage Company & Team Settings"
        >
          {/* Company Avatar / Logo */}
          <div className="relative">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={companyName}
                className="h-10 w-10 object-contain rounded-xl bg-white p-0.5 border border-slate-200 shadow-2xs group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                {companyName ? companyName[0]?.toUpperCase() : "HQ"}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-slate-950 text-[9px] font-black shadow-xs ring-2 ring-white">
              👑
            </span>
          </div>

          {/* Company & User Metadata */}
          <div className="text-left min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-black text-xs sm:text-sm text-slate-900 tracking-tight truncate max-w-[150px] sm:max-w-[180px]">
                {companyName || "Workspace"}
              </span>
              <Badge className="bg-amber-100 hover:bg-amber-100 text-amber-900 border-amber-300 text-[9px] font-extrabold px-1.5 py-0 gap-1 uppercase tracking-wider shrink-0 shadow-2xs">
                <Crown className="h-2.5 w-2.5 text-amber-700" />
                Company Owner
              </Badge>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium mt-0.5 truncate max-w-[220px] sm:max-w-[280px]">
              <span className="font-semibold text-slate-700 truncate">{userName}</span>
              {userEmail && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 truncate text-[10px] flex items-center gap-1">
                    <Mail className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                    {userEmail}
                  </span>
                </>
              )}
            </div>
          </div>

          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-1 hidden sm:block" />
        </Link>
      ) : (
        <div className="flex items-center gap-3 p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          {/* Company Avatar / Logo */}
          <div className="relative">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={companyName}
                className="h-10 w-10 object-contain rounded-xl bg-white p-0.5 border border-slate-200 shadow-2xs"
              />
            ) : (
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                {companyName ? companyName[0]?.toUpperCase() : "HQ"}
              </div>
            )}
          </div>

          {/* Company & User Metadata */}
          <div className="text-left min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-black text-xs sm:text-sm text-slate-900 tracking-tight truncate max-w-[150px] sm:max-w-[180px]">
                {companyName || "Workspace"}
              </span>
              <Badge className="bg-blue-100 text-blue-900 border-blue-300 text-[9px] font-extrabold px-1.5 py-0 uppercase tracking-wider shrink-0 shadow-2xs">
                {userRole}
              </Badge>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium mt-0.5 truncate max-w-[220px] sm:max-w-[280px]">
              <span className="font-semibold text-slate-700 truncate">{userName}</span>
              {userEmail && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 truncate text-[10px] flex items-center gap-1">
                    <Mail className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                    {userEmail}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;

