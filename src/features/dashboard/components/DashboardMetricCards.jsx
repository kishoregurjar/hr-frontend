"use client";

import { Users, FileText, Send, CheckCircle2 } from "lucide-react";
import { useDashboardOverview } from "@/features/dashboard/hooks";

const DashboardMetricCards = () => {
  const { data: overview, isLoading } = useDashboardOverview();

  // Dynamic live counts from single aggregated overview API
  const totalCandidates = overview?.candidates?.total ?? 0;
  const activeAssessments = overview?.assessments?.active ?? 0;
  const invitationsTotal = overview?.invitations?.total ?? 0;
  const invitationsCompleted = overview?.invitations?.completed ?? 0;
  const attemptsSubmitted = overview?.attempts?.submitted ?? 0;

  const cardBaseStyle =
    "rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-5 sm:p-6 shadow-[0_12px_30px_rgba(79,70,229,0.08),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 transition-all duration-200 hover:shadow-lg flex flex-col justify-between space-y-4 select-none";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* ── Card 1: Total Candidates ── */}
      <div className={cardBaseStyle}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            TOTAL CANDIDATES
          </span>
          <div className="h-9 w-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
            <Users className="h-4 w-4" />
          </div>
        </div>

        <div>
          <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {isLoading ? "—" : totalCandidates}
          </p>
          <p className="text-xs text-slate-400 font-medium mt-1">
            In candidate pipeline
          </p>
        </div>
      </div>

      {/* ── Card 2: Active Assessments ── */}
      <div className={cardBaseStyle}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            ACTIVE ASSESSMENTS
          </span>
          <div className="h-9 w-9 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-xs">
            <FileText className="h-4 w-4" />
          </div>
        </div>

        <div>
          <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {isLoading ? "—" : activeAssessments}
          </p>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Published screening tests
          </p>
        </div>
      </div>

      {/* ── Card 3: Invitations Dispatched ── */}
      <div className={cardBaseStyle}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            INVITATIONS DISPATCHED
          </span>
          <div className="h-9 w-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
            <Send className="h-4 w-4" />
          </div>
        </div>

        <div>
          <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {isLoading ? "—" : invitationsTotal}
          </p>
          <p className="text-xs text-slate-400 font-medium mt-1">
            {invitationsCompleted} completed by candidates
          </p>
        </div>
      </div>

      {/* ── Card 4: Completed Evaluations ── */}
      <div className={cardBaseStyle}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            COMPLETED EVALUATIONS
          </span>
          <div className="h-9 w-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>

        <div>
          <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {isLoading ? "—" : attemptsSubmitted}
          </p>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Submitted & scored
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardMetricCards;
