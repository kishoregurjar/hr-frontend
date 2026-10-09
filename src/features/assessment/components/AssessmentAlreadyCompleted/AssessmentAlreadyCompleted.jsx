"use client";

import React from "react";
import {
  CheckCircle2,
  Clock,
  Building2,
  User,
  ShieldCheck,
  FileCheck,
  HelpCircle,
  Sparkles,
  Award,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AssessmentAlreadyCompleted({
  assessment,
  assignment,
  candidate,
  attempt,
}) {
  const companyName =
    assessment?.companyName ||
    assessment?.company?.name ||
    assignment?.companyName ||
    assignment?.candidate?.company?.name ||
    "Hiring Team";

  const companyLogo =
    assessment?.companyLogo ||
    assessment?.company?.logoUrl ||
    assignment?.companyLogo ||
    null;

  const candidateName =
    candidate?.name ||
    assignment?.candidateName ||
    assignment?.candidate?.name ||
    "Candidate";

  const candidateEmail =
    candidate?.email ||
    assignment?.email ||
    assignment?.candidateEmail ||
    "";

  const assessmentTitle =
    assessment?.title ||
    assignment?.assessmentTitle ||
    "Candidate Assessment";

  // Resolve submission timestamp cleanly
  const rawSubmittedAt =
    attempt?.submittedAt ||
    assignment?.submittedAt ||
    assignment?.completedAt ||
    attempt?.completedAt ||
    null;

  const formattedSubmittedAt = rawSubmittedAt
    ? new Date(rawSubmittedAt).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata",
      })
    : null;

  // Real score if valid and not empty fallback
  const hasRealScore =
    attempt?.score !== undefined &&
    attempt?.score !== null &&
    !isNaN(Number(attempt?.score)) &&
    (attempt?.percentage !== undefined || attempt?.score > 0);

  const realScore = hasRealScore ? Math.round(Number(attempt?.percentage ?? attempt?.score)) : null;
  const realResult = attempt?.result || (realScore !== null && realScore >= 60 ? "PASSED" : null);

  const monogram = companyName
    ? companyName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "HQ";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Top Company Badge Bar */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={companyName}
                className="h-10 w-10 object-contain rounded-xl border border-slate-200 bg-white p-1 shadow-2xs"
              />
            ) : (
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {monogram}
              </div>
            )}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Evaluation Portal
              </p>
              <h2 className="text-sm font-bold text-slate-800">{companyName}</h2>
            </div>
          </div>

          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold px-2.5 py-1 text-xs flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Submitted
          </Badge>
        </div>

        {/* Main Hero Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xl shadow-slate-900/5 text-center">
          {/* Subtle Ambient Light Glow */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Success Check Badge */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-blue-500/10 border border-emerald-200 text-emerald-600 shadow-sm relative">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
              <Sparkles className="h-2.5 w-2.5" />
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Assessment Already Completed
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 font-medium max-w-lg mx-auto leading-relaxed">
            You have already completed and submitted your test for{" "}
            <span className="font-semibold text-slate-900">{companyName}</span>.
            Responses have been securely recorded and finalized in the hiring system.
          </p>

          {formattedSubmittedAt && (
            <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              <span>Submitted on {formattedSubmittedAt}</span>
            </div>
          )}

          {/* Optional Genuine Score Card if verified */}
          {realScore !== null && (
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-emerald-200/80 max-w-md mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Award className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Recorded Quiz Score
                </span>
              </div>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-3xl font-black text-slate-900 font-mono">
                  {realScore}%
                </span>
                {realResult && (
                  <Badge
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 ${
                      realResult === "PASSED"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : "bg-rose-100 text-rose-800 border-rose-300"
                    }`}
                  >
                    {realResult}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Details Breakdown */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70">
              <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">
                <FileCheck className="h-3.5 w-3.5 text-blue-600" />
                <span>Assessment</span>
              </div>
              <p className="text-sm font-bold text-slate-800 truncate">
                {assessmentTitle}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70">
              <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">
                <User className="h-3.5 w-3.5 text-indigo-600" />
                <span>Candidate</span>
              </div>
              <p className="text-sm font-bold text-slate-800 truncate">
                {candidateName}
              </p>
              {candidateEmail && (
                <p className="text-[11px] text-slate-500 truncate font-mono">
                  {candidateEmail}
                </p>
              )}
            </div>
          </div>

          {/* Single-Attempt Policy Alert */}
          <div className="mt-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-left flex gap-3">
            <ShieldCheck className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed space-y-1">
              <p className="font-bold">Single-Submission Policy</p>
              <p className="text-amber-800/90">
                To maintain standard recruitment integrity, candidates can only attempt this assessment once. Multiple attempts are not permitted.
              </p>
            </div>
          </div>

          {/* Next Steps Card */}
          <div className="mt-4 p-4 rounded-2xl bg-blue-50/60 border border-blue-200/70 text-left flex gap-3">
            <Building2 className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 leading-relaxed space-y-1">
              <p className="font-bold">What happens next?</p>
              <p className="text-blue-800/90">
                The recruitment team at <span className="font-semibold">{companyName}</span> is reviewing your responses. You will be contacted via email if your application moves to the next evaluation round.
              </p>
            </div>
          </div>

          {/* Recruiter Help Line */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
            <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
            <span>
              If you have any questions or believe this is an error, please reach out to the hiring team at{" "}
              <strong className="text-slate-700">{companyName}</strong>.
            </span>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-slate-400 font-medium">
          HireQuest Talent Assessment Platform • You may now safely close this browser window.
        </p>

      </div>
    </div>
  );
}
