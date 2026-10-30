"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/context";
import { ASSESSMENT_STATUS } from "../constants";
import { AssessmentBuilder } from "../components";
import { useAssessmentQuery } from "../hooks";
import { toAssessmentBuilder } from "../utils";

const EditAssessment = ({ assessmentId }) => {
  const { user } = useAuth();
  const scrollContainerRef = useRef(null);
  const farBgRef = useRef(null);
  const midHeroRef = useRef(null);

  const companyName =
    user?.companyName ||
    user?.company?.name ||
    user?.company ||
    (typeof window !== "undefined" ? localStorage.getItem("companyName") : null) ||
    "Facebook Company";

  const {
    data: assessment,
    isLoading,
    isError,
    error,
  } = useAssessmentQuery(assessmentId);

  // ── Parallax Scroll Handler ──
  const handleScroll = () => {
    const scrollY = scrollContainerRef.current?.scrollTop || 0;

    if (farBgRef.current) {
      const orbTranslate = scrollY * 0.58;
      const orbRotate = scrollY * 0.05;
      const orbScale = 1 + scrollY * 0.0003;
      farBgRef.current.style.transform = `translate3d(0, ${orbTranslate}px, 0) scale(${orbScale}) rotate(${orbRotate}deg)`;
    }

    if (midHeroRef.current) {
      const heroProgress = Math.min(scrollY / 450, 1);
      const heroTranslate = scrollY * 0.42;
      const heroOpacity = Math.max(1 - heroProgress * 0.75, 0.2);
      const heroScale = 1 - heroProgress * 0.06;
      midHeroRef.current.style.transform = `translate3d(0, ${heroTranslate}px, 0) scale(${heroScale})`;
      midHeroRef.current.style.opacity = heroOpacity;
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-white/90 bg-white/95 p-16 text-center shadow-lg max-w-2xl mx-auto my-12 space-y-3 font-sans">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
        <p className="text-sm font-bold text-slate-700">
          Loading assessment details...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-white p-12 text-center shadow-lg max-w-2xl mx-auto my-12 space-y-3 font-sans">
        <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
        <h2 className="font-extrabold text-slate-900 text-lg">
          Unable to load assessment
        </h2>
        <p className="text-xs font-medium text-slate-500">
          {error?.message || "Assessment could not be found or has expired."}
        </p>
        <Link href="/assessments">
          <Button variant="outline" className="mt-4 rounded-xl border-slate-200 text-xs font-bold cursor-pointer">
            Back to Assessments
          </Button>
        </Link>
      </div>
    );
  }

  if (assessment?.status === ASSESSMENT_STATUS.ARCHIVED) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-white p-12 text-center shadow-lg max-w-2xl mx-auto my-12 space-y-3 font-sans">
        <AlertCircle className="h-8 w-8 text-amber-500 mx-auto" />
        <h2 className="text-lg font-extrabold text-slate-900">
          Assessment is archived
        </h2>
        <p className="text-xs font-medium text-slate-500">
          Restore this assessment before editing its modules and questions.
        </p>
        <Link href="/assessments">
          <Button variant="outline" className="mt-4 rounded-xl border-slate-200 text-xs font-bold cursor-pointer">
            Back to Assessments
          </Button>
        </Link>
      </div>
    );
  }

  const initialAssessment = toAssessmentBuilder(assessment);

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="-m-4 md:-m-6 h-[calc(100dvh-64px)] max-h-[calc(100dvh-64px)] overflow-y-auto overflow-x-hidden relative bg-[#f8fafc] no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden font-sans"
    >
      {/* ── 3D Parallax Hero Header ── */}
      <div className="relative bg-gradient-to-r from-[#4E35E8] via-[#6D38F0] to-[#CF2E9F] text-white pt-10 pb-28 md:pb-32 px-6 md:px-12 overflow-hidden shadow-lg select-none">
        {/* Ambient background */}
        <div
          ref={farBgRef}
          className="absolute inset-0 pointer-events-none will-change-transform"
          style={{ transform: "translate3d(0, 0, 0)" }}
        >
          <div className="absolute -top-28 -right-28 w-[450px] h-[450px] rounded-full bg-white/12 blur-3xl" />
          <div className="absolute -top-16 -right-16 w-[380px] h-[380px] rounded-full border border-white/20" />
          <div className="absolute top-10 right-16 w-[260px] h-[260px] rounded-full border border-white/15" />
          <div className="absolute top-28 right-36 w-[140px] h-[140px] rounded-full border border-white/10" />
          <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-white/40 blur-[1px] animate-pulse" />
          <div className="absolute top-1/3 left-2/3 w-2.5 h-2.5 rounded-full bg-pink-200/50 blur-[1px] animate-pulse" />
        </div>

        {/* Hero Content */}
        <div
          ref={midHeroRef}
          className="max-w-7xl mx-auto space-y-4 relative z-10 will-change-transform"
          style={{ transform: "translate3d(0, 0, 0)" }}
        >
          <div className="space-y-1">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-white/75 drop-shadow-xs">
              {companyName}
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm">
              Edit Assessment
            </h1>
            <p className="text-white/85 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl">
              Update assessment details, cognitive games selection, question pool, and proctoring settings.
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-2.5 px-4 flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 text-white shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-xl bg-white/20 border border-white/30 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="text-xs min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white shrink-0 text-xs">Editing:</span>
                  <span className="font-extrabold text-white truncate max-w-xs">{assessment?.title || "Assessment"}</span>
                  <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/40 text-[11px] py-0.5 px-2.5 flex items-center gap-1.5 font-semibold rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                    Live Editor
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link href="/assessments">
                <Button
                  type="button"
                  size="sm"
                  className="text-xs h-8 px-3.5 gap-1.5 bg-white text-indigo-700 hover:bg-slate-50 font-bold rounded-xl shadow-xs cursor-pointer transition-all"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Assessments
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 md:-mt-20 relative z-20 space-y-6 pb-20">
        <AssessmentBuilder
          mode="edit"
          assessmentId={assessmentId}
          initialAssessment={initialAssessment}
        />
      </div>
    </div>
  );
};

export default EditAssessment;
