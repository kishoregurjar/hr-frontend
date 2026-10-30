"use client";

import { useMemo } from "react";
import { Mail, Send, Sparkles, Users } from "lucide-react";

const CandidateStatsCards = ({ candidates = [] }) => {
  const stats = useMemo(() => {
    const total = candidates.length;
    const emailIngested = candidates.filter(
      (c) =>
        String(c.source || "").toLowerCase().includes("email") ||
        String(c.sourceType || "").toLowerCase().includes("email") ||
        Boolean(c.inboundEmailId) ||
        Boolean(c.emailSubject) ||
        Boolean(c.inboundEventId)
    ).length;
    const newApplicants = candidates.filter((c) => {
      const s = String(c.status || "").toLowerCase();
      return s === "new" || s === "uninvited" || s === "not_started" || !s;
    }).length;
    const invited = candidates.filter((c) => {
      const s = String(c.status || "").toLowerCase();
      return s === "invited" || s === "sent" || s.includes("invit");
    }).length;
    const shortlisted = candidates.filter((c) => {
      const s = String(c.status || "").toLowerCase();
      return s === "shortlisted";
    }).length;

    return {
      total,
      emailIngested,
      newApplicants,
      invited,
      shortlisted,
    };
  }, [candidates]);

  const cardBaseStyle =
    "rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-5 sm:p-6 shadow-[0_12px_30px_rgba(79,70,229,0.08),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 transition-all duration-200 hover:shadow-lg flex flex-col justify-between space-y-4 select-none";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
      {/* ── Card 1: Total Applications ── */}
      <div className={cardBaseStyle}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            TOTAL APPLICATIONS
          </span>
          <div className="h-9 w-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
            <Users className="h-4 w-4" />
          </div>
        </div>

        <div>
          <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {stats.total}
          </p>
          <p className="text-xs text-slate-400 font-medium mt-1">
            In candidate pipeline
          </p>
        </div>
      </div>

      {/* ── Card 2: Email Ingested ── */}
      <div className={cardBaseStyle}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            EMAIL INGESTED
          </span>
          <div className="h-9 w-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
            <Mail className="h-4 w-4" />
          </div>
        </div>

        <div>
          <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {stats.emailIngested}
          </p>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Parsed from HR inbox
          </p>
        </div>
      </div>

      {/* ── Card 3: New Applicants ── */}
      <div className={cardBaseStyle}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            NEW APPLICANTS
          </span>
          <div className="h-9 w-9 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
        </div>

        <div>
          <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {stats.newApplicants}
          </p>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Awaiting screening review
          </p>
        </div>
      </div>

      {/* ── Card 4: Invited to Test ── */}
      <div className={cardBaseStyle}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            INVITED TO TEST
          </span>
          <div className="h-9 w-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
            <Send className="h-4 w-4" />
          </div>
        </div>

        <div>
          <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {stats.invited}
          </p>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Assessment link dispatched
          </p>
        </div>
      </div>
    </div>
  );
};

export default CandidateStatsCards;
