"use client";

import React from "react";
import { CheckCircle2, Clock } from "lucide-react";

export default function AssessmentAlreadyCompleted({
  assessment,
  assignment,
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

  const monogram = companyName
    ? companyName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "HQ";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 py-12 px-4 sm:px-6 font-sans flex items-center justify-center">
      <div className="w-full max-w-lg">
        {/* Main Clean Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-10 shadow-xl shadow-slate-900/5 text-center">
          {/* Subtle Ambient Light Glow */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-28 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Company Branding */}
          <div className="mb-6 flex items-center justify-center">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={companyName}
                className="h-10 max-w-[160px] object-contain"
              />
            ) : (
              <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700">
                <span className="h-6 w-6 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-xs font-bold">
                  {monogram}
                </span>
                <span className="text-xs font-bold tracking-tight">
                  {companyName}
                </span>
              </div>
            )}
          </div>

          {/* Success Check Icon */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100/90 text-emerald-600 shadow-xs">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 stroke-[2.2]" />
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
            Assessment Already Submitted
          </h1>

          {/* Concise 2-line description */}
          <p className="mt-3 text-sm text-slate-500 font-normal leading-relaxed max-w-sm mx-auto">
            You have already completed and submitted this assessment for{" "}
            <span className="font-semibold text-slate-700">{companyName}</span>.
            Your responses have been securely recorded.
          </p>

          {/* Timestamp Pill (Subtle) */}
          {formattedSubmittedAt && (
            <div className="mt-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-600">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>Submitted on {formattedSubmittedAt}</span>
            </div>
          )}

          {/* Soft Divider */}
          <div className="my-7 border-t border-slate-100" />

          {/* Safe Close Guidance */}
          <p className="text-xs text-slate-400 font-normal">
            You may now safely close this browser window.
          </p>
        </div>

        {/* Platform Signature */}
        <p className="text-center text-[11px] text-slate-400 font-medium mt-6">
          HireQuest Talent Assessment Platform
        </p>
      </div>
    </div>
  );
}
