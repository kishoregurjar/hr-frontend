"use client";

import { useMemo } from "react";
import { Users, FileText, Send, Bookmark, TrendingUp } from "lucide-react";
import { useAssessmentsQuery } from "@/features/assessment/hooks";
import { useCandidatesQuery } from "@/features/candidate/hooks";

const DashboardMetricCards = () => {
  const { data: assessments = [] } = useAssessmentsQuery();
  const { data: candidates = [] } = useCandidatesQuery();

  const publishedCount = useMemo(() => {
    return assessments.filter(
      (a) =>
        String(a.status).toUpperCase() === "PUBLISHED" ||
        String(a.status).toUpperCase() === "ACTIVE"
    ).length;
  }, [assessments]);

  const totalCandidates = candidates.length;
  const activeAssessments = publishedCount;
  const invitationsDispatched = 0;
  const shortlistedCount = candidates.filter(
    (c) => String(c.status || "").toLowerCase() === "shortlisted"
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* ── Card 1: Total Candidates ── */}
      <div className="rounded-2xl border bg-card p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Total Candidates
          </span>
          <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <Users className="h-4 w-4" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-2.5">
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              {totalCandidates}
            </p>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200/60">
              <TrendingUp className="h-3 w-3" />
              +12% this week
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            In pipeline
          </p>
        </div>
      </div>

      {/* ── Card 2: Active Assessments ── */}
      <div className="rounded-2xl border bg-card p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Active Assessments
          </span>
          <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
            <FileText className="h-4 w-4" />
          </div>
        </div>

        <div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            {activeAssessments}
          </p>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            Published screening tests
          </p>
        </div>
      </div>

      {/* ── Card 3: Invitations Dispatched ── */}
      <div className="rounded-2xl border bg-card p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Invitations Dispatched
          </span>
          <div className="h-9 w-9 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
            <Send className="h-4 w-4" />
          </div>
        </div>

        <div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            {invitationsDispatched}
          </p>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            3 Completed
          </p>
        </div>
      </div>

      {/* ── Card 4: Shortlisted Candidates ── */}
      <div className="rounded-2xl border bg-card p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Shortlisted Candidates
          </span>
          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <Bookmark className="h-4 w-4" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-2.5">
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              {shortlistedCount}
            </p>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200/60">
              <TrendingUp className="h-3 w-3" />
              Top 15%
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            Avg Score: 63.8%
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardMetricCards;
