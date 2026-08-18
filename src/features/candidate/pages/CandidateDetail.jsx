"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  CandidateAssessments,
  CandidateDetails,
  EditCandidateDialog,
} from "../components";
import { useCandidateQuery } from "../hooks";

const CandidateDetail = ({ candidateId }) => {
  const {
    data: candidate,
    isLoading,
    isError,
    error,
    refetch,
  } = useCandidateQuery(candidateId);

  if (isLoading) {
    return (
      <div className="rounded-xl border p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Loading candidate...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/50 p-12 text-center">
        <h2 className="font-semibold">Unable to load candidate</h2>

        <p className="mt-2 text-sm text-muted-foreground">
          {error?.message || "Something went wrong."}
        </p>

        <div className="mt-4 flex justify-center gap-3">
          <Link href="/candidates">
            <Button variant="outline">
              Back to Candidates
            </Button>
          </Link>

          <Button type="button" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Link href="/candidates">
        <Button variant="ghost" className="-ml-3">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Candidates
        </Button>
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {candidate.name}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            View and manage candidate information.
          </p>
        </div>

        <EditCandidateDialog candidate={candidate} />
      </div>

      <CandidateDetails candidate={candidate} />

      <CandidateAssessments candidateId={candidate.id} />
    </div>
  );
};

export default CandidateDetail;
