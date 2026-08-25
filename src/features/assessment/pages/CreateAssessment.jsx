"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context";
import { AssessmentBuilder } from "../components";

const CreateAssessment = () => {
  const { user } = useAuth();
  const rawName = user?.name || user?.fullName || "Sarah Jenkins";
  const userName = rawName.replace(/\s+user$/i, "").trim() || "Sarah Jenkins";
  const companyName = user?.company || "HireQuest HR";

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* ── 1. SINGLE, CLEAN HEADER (No Redundancy) ── */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Assessment
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Build a multi-module hiring assessment combining cognitive games, problem-solving puzzles, and technical MCQs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* User HR Chip */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-semibold shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span className="font-bold text-slate-900">{userName}</span>
            <span className="text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-200/70 px-1.5 py-0.5 rounded ml-0.5">
              HR
            </span>
          </div>

          {/* Back to Assessments Link */}
          <Link href="/assessments">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-semibold text-xs h-9 px-3 rounded-xl shadow-2xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Assessments
            </Button>
          </Link>
        </div>
      </div>

      {/* ── 2. Multi-Step Assessment Builder ── */}
      <AssessmentBuilder />
    </div>
  );
};

export default CreateAssessment;
