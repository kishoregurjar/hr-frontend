"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context";
import { AssessmentBuilder } from "../components";

const CreateAssessment = () => {
  const { user } = useAuth();
  const rawName =
    (typeof user?.name === "string" ? user.name : "") ||
    (typeof user?.fullName === "string" ? user.fullName : "") ||
    "HR Manager";
  const userName = String(rawName).replace(/\s+user$/i, "").trim() || "HR Manager";
  const companyName =
    user?.companyName ||
    user?.company?.name ||
    user?.company ||
    (typeof window !== "undefined" ? localStorage.getItem("companyName") : null) ||
    "";

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
