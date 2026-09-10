"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, FileText, Crown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    (typeof window !== "undefined" ? localStorage.getItem("companyName") : null) ||
    user?.companyName ||
    user?.company?.name ||
    user?.company ||
    "Walking Dreamz";

  const rawName =
    (typeof user?.name === "string" && user.name.toLowerCase() !== "hr" ? user.name : "") ||
    (typeof user?.fullName === "string" && user.fullName.toLowerCase() !== "hr" ? user.fullName : "") ||
    "Rohit Panchal";
  const ownerName = String(rawName).replace(/\s+user$/i, "").trim() || "Rohit Panchal";

  const ownerEmail =
    (typeof user?.email === "string" && user.email) ||
    (typeof window !== "undefined" ? localStorage.getItem("user_email") : null) ||
    "rohitpanchal958466@gmail.com";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/15 border border-indigo-400/20">
      {/* Background ambient lighting accents */}
      <div className="absolute right-0 top-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute left-1/4 bottom-0 h-44 w-44 rounded-full bg-cyan-400/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          {/* Workspace & Owner Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
              <Crown className="h-3 w-3 text-amber-300" />
              <span>COMPANY OWNER</span>
              {companyName && (
                <>
                  <span className="text-white/60">•</span>
                  <span className="font-extrabold text-amber-200">{companyName}</span>
                </>
              )}
              {impersonated && (
                <>
                  <span className="text-white/60">•</span>
                  <span className="bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded text-[9px] font-black uppercase">
                    Inspecting
                  </span>
                </>
              )}
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 border border-white/15 text-blue-100 text-[11px] font-medium backdrop-blur-md">
              <Mail className="h-3 w-3 text-blue-200 shrink-0" />
              <span>{ownerEmail}</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            Automated Candidate Screening Pipeline
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-blue-50/90 leading-relaxed max-w-2xl font-normal">
            Welcome back, <strong className="text-white font-bold">{ownerName}</strong>. You have full ownership permissions over <strong className="text-white font-bold">{companyName}</strong>. Deploy multi-module cognitive assessments, manage candidate pipelines, and shortlist top talent with authoritative scoring.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link href="/candidates">
            <Button
              className="h-11 px-5 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 hover:text-indigo-800 font-bold text-xs gap-2 shadow-lg shadow-black/10 transition-all border border-white/80"
            >
              <Mail className="h-4 w-4 text-indigo-600" />
              Extract / Add Candidates
            </Button>
          </Link>

          <Link href="/assessments/create">
            <Button
              variant="outline"
              className="h-11 px-5 rounded-xl bg-indigo-700/40 hover:bg-indigo-700/60 text-white font-semibold text-xs gap-2 border-white/30 backdrop-blur-md transition-all"
            >
              <FileText className="h-4 w-4 text-white" />
              Assessment Builder
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeroBanner;

