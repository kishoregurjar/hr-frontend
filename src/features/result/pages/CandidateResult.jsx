"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  CandidateDecision,
  ResultOverview,
  ResultStatusBadge,
  ResultTimeline,
  SectionBreakdown,
} from "../components";

import {
  CANDIDATE_DECISION,
} from "../constants";
import {
  useResultDetail,
  useUpdateCandidateDecision,
} from "../hooks";

const CandidateResult = ({ assessmentId, resultId }) => {
  const router = useRouter();

  const {
    data: result,
    isLoading,
    isError,
    error,
  } = useResultDetail({
    assessmentId,
    resultId,
  });

  const updateDecision = useUpdateCandidateDecision();

  const handleBack = () => {
    router.push(`/assessments/${assessmentId}/results`);
  };

  const handleShortlist = () => {
    updateDecision.mutate({
      resultId: result.id,
      decision: CANDIDATE_DECISION.SHORTLISTED,
    });
  };

  const handleReject = () => {
    updateDecision.mutate({
      resultId: result.id,
      decision: CANDIDATE_DECISION.REJECTED,
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading candidate result...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !result) {
    return (
      <div className="flex min-h-[400px] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h2 className="text-xl font-semibold text-slate-900">
            Result unavailable
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {error?.message ?? "Unable to load candidate result."}
          </p>
          <Button className="mt-6" variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Results
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Button
          type="button"
          variant="ghost"
          className="px-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Results
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Candidate Result
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            {result.candidate.name}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {result.candidate.email}
          </p>
          <p className="mt-3 font-semibold text-slate-800">
            {result.assessment?.title}
          </p>
        </div>

        <ResultStatusBadge status={result.status} />
      </div>

      <ResultOverview result={result} />

      <CandidateDecision
        decision={result.decision ?? CANDIDATE_DECISION.PENDING}
        onShortlist={handleShortlist}
        onReject={handleReject}
        isUpdating={updateDecision.isPending}
      />

      {updateDecision.isError && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive">
            {updateDecision.error?.message ?? "Unable to update candidate decision."}
          </p>
        </div>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Section Breakdown
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Candidate performance across quizzes and games.
          </p>
        </div>

        <SectionBreakdown sections={result.sections} />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Assessment Timeline
          </h2>
        </div>

        <ResultTimeline result={result} />
      </section>
    </div>
  );
};

export default CandidateResult;
