"use client";

import Link from "next/link";
import { Sparkles, ArrowUpRight } from "lucide-react";

const WORKFLOW_STEPS = [
  {
    number: "1",
    title: "Extract / Ingest Candidates",
    description: "Parse recruiter inbox threads or import CSV files with resumes.",
    href: "/candidates",
  },
  {
    number: "2",
    title: "Configure Assessment Modules",
    description: "Combine Pattern Games, Memory Challenges & MCQ Question papers.",
    href: "/assessments/create",
  },
  {
    number: "3",
    title: "Dispatch Secure Invitations",
    description: "Select candidates with checkboxes and email individual secure links.",
    href: "/candidates",
  },
  {
    number: "4",
    title: "Review Leaderboard & Shortlist",
    description: "Analyze cognitive performance breakdown and advance top talent.",
    href: "/results",
  },
];

const ScreeningWorkflowCard = () => {
  return (
    <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b">
        <Sparkles className="h-5 w-5 text-blue-600" />
        <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
          Screening Workflow
        </h3>
      </div>

      {/* 4 Steps */}
      <div className="space-y-2.5">
        {WORKFLOW_STEPS.map((step) => (
          <Link
            key={step.number}
            href={step.href}
            className="group block p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-300/80 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {step.number}. {step.title}
              </p>
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 transition-colors" />
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-1 font-normal">
              {step.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ScreeningWorkflowCard;
