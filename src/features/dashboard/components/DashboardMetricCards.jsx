"use client";

import { Users, FileText, Send, CheckCircle2, TrendingUp, Inbox } from "lucide-react";
import { useDashboardOverview } from "@/features/dashboard/hooks";

const DashboardMetricCards = () => {
  const { data: overview, isLoading } = useDashboardOverview();

  // Extract counts from backend overview object
  const totalCandidates = overview?.candidates?.total ?? 0;
  const parsedFromEmail = overview?.candidates?.parsedFromEmail ?? 0;

  const activeAssessments = overview?.assessments?.active ?? overview?.assessments?.total ?? 0;
  const totalAssessments = overview?.assessments?.total ?? 0;

  const invitationsTotal = overview?.invitations?.total ?? 0;
  const invitationsCompleted = overview?.invitations?.completed ?? 0;

  const attemptsTotal = overview?.attempts?.total ?? 0;
  const attemptsSubmitted = overview?.attempts?.submitted ?? 0;

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
              {isLoading ? "—" : totalCandidates}
            </p>
            {parsedFromEmail > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200/60">
                <Inbox className="h-3 w-3" />
                {parsedFromEmail} from email
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            In candidate pipeline
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
          <div className="flex items-baseline gap-2.5">
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              {isLoading ? "—" : activeAssessments}
            </p>
            {totalAssessments > 0 && (
              <span className="text-[11px] font-semibold text-slate-500">
                / {totalAssessments} total
              </span>
            )}
          </div>
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
            {isLoading ? "—" : invitationsTotal}
          </p>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            {invitationsCompleted} completed by candidates
          </p>
        </div>
      </div>

      {/* ── Card 4: Assessment Attempts ── */}
      <div className="rounded-2xl border bg-card p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Completed Evaluations
          </span>
          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-2.5">
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              {isLoading ? "—" : attemptsSubmitted}
            </p>
            {attemptsTotal > 0 && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200/60">
                <TrendingUp className="h-3 w-3" />
                {attemptsTotal} attempts
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            Submitted & scored
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardMetricCards;
