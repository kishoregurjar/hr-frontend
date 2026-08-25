"use client";

import { ChevronDown, Sparkles } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";

const DashboardHeader = () => {
  const { user } = useAuth();
  const rawName = user?.name || user?.fullName || "Sarah Jenkins";
  const userName = rawName.replace(/\s+user$/i, "").trim() || "Sarah Jenkins";
  const companyName = user?.company || "TechCorp Solutions";

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-1">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Recruitment Analytics & Screening
        </h1>
        <p className="text-xs text-muted-foreground font-medium mt-0.5">
          Monitor candidate assessments, pipeline throughput, and score distributions in real time.
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* User HR Chip */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-semibold shadow-2xs">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span className="font-bold text-slate-900">{userName}</span>
          <span className="text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-200/70 px-1.5 py-0.5 rounded ml-0.5">
            HR
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
