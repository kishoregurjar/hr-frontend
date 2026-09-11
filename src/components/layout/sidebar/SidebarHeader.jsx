"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/context";

export default function SidebarHeader() {
  const { user } = useAuth();
  const [dynamicLogo, setDynamicLogo] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("companyLogo") : null
  );

  useEffect(() => {
    const handleLogoUpdate = () => {
      if (typeof window !== "undefined") {
        setDynamicLogo(localStorage.getItem("companyLogo"));
      }
    };

    window.addEventListener("companyLogoUpdated", handleLogoUpdate);
    window.addEventListener("storage", handleLogoUpdate);
    return () => {
      window.removeEventListener("companyLogoUpdated", handleLogoUpdate);
      window.removeEventListener("storage", handleLogoUpdate);
    };
  }, []);

  const companyLogo =
    dynamicLogo ||
    (typeof window !== "undefined" ? localStorage.getItem("companyLogo") : null) ||
    user?.companyLogo ||
    user?.company?.logo ||
    null;
  const companyName =
    user?.companyName ||
    user?.company?.name ||
    (typeof user?.company === "string" ? user.company : null) ||
    (typeof window !== "undefined" ? localStorage.getItem("companyName") : null) ||
    "";
  const companyDomain =
    user?.companyDomain ||
    user?.company?.domain ||
    user?.domain ||
    (typeof window !== "undefined" ? localStorage.getItem("companyDomain") : null) ||
    "";

  const getInitials = (name) => {
    const str = String(name || "").trim();
    if (!str) return "HQ";
    const parts = str.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  };

  return (
    <div className="border-b px-5 py-4">
      <Link
        href="/dashboard"
        className="flex items-center gap-3 min-w-0"
      >
        {companyLogo ? (
          <img
            src={companyLogo}
            alt={companyName || "Company"}
            className="h-10 w-10 rounded-xl object-contain bg-white border border-slate-200 p-1 shadow-2xs shrink-0"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-sm font-extrabold text-white shadow-xs shrink-0">
            {getInitials(companyName)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h1 className="text-sm font-extrabold tracking-tight text-slate-900 leading-tight truncate">
            {companyName || "HireQuest"}
          </h1>
          <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
            {companyDomain || "Recruitment Workspace"}
          </p>
        </div>
      </Link>
    </div>
  );
}
