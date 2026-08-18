"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  BulkResultActions,
  ResultFilters,
  ResultSummary,
  ResultsTable,
} from "../components";
import {
  CANDIDATE_DECISION,
} from "../constants";
import {
  useAssessmentResults,
  useAssessmentResultSummary,
  useBulkCandidateDecision,
} from "../hooks";
import { rankCandidateResults } from "../utils";

const AssessmentResults = ({ assessmentId, assessmentTitle }) => {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [decision, setDecision] = useState("all");
  const [selectedResultIds, setSelectedResultIds] = useState([]);
  const [pendingBulkDecision, setPendingBulkDecision] = useState(null);

  const {
    data: results = [],
    isLoading,
    isError,
  } = useAssessmentResults(assessmentId);

  const {
    data: summary,
    isLoading: summaryLoading,
  } = useAssessmentResultSummary(assessmentId);

  const bulkDecision = useBulkCandidateDecision();

  const rankedResults = useMemo(() => {
    return rankCandidateResults(results);
  }, [results]);

  const filteredResults = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rankedResults.filter((result) => {
      const matchesSearch =
        !query ||
        result.candidate.name.toLowerCase().includes(query) ||
        result.candidate.email.toLowerCase().includes(query);

      const matchesStatus = status === "all" || result.status === status;
      const matchesDecision =
        decision === "all" || (result.decision ?? "Pending") === decision;

      return matchesSearch && matchesStatus && matchesDecision;
    });
  }, [rankedResults, search, status, decision]);

  const selectableResultIds = useMemo(() => {
    return filteredResults
      .filter((result) => result.status === "Completed")
      .map((result) => result.id);
  }, [filteredResults]);

  const areAllSelected = useMemo(() => {
    return (
      selectableResultIds.length > 0 &&
      selectableResultIds.every((id) => selectedResultIds.includes(id))
    );
  }, [selectableResultIds, selectedResultIds]);

  const toggleResultSelection = (resultId) => {
    setSelectedResultIds((current) =>
      current.includes(resultId)
        ? current.filter((id) => id !== resultId)
        : [...current, resultId]
    );
  };

  const handleToggleAll = () => {
    if (areAllSelected) {
      setSelectedResultIds((current) =>
        current.filter((id) => !selectableResultIds.includes(id))
      );
      return;
    }

    setSelectedResultIds((current) => [
      ...new Set([...current, ...selectableResultIds]),
    ]);
  };

  const clearSelection = () => {
    setSelectedResultIds([]);
  };

  const handleConfirmBulkDecision = () => {
    if (!pendingBulkDecision || selectedResultIds.length === 0) return;

    bulkDecision.mutate(
      {
        resultIds: selectedResultIds,
        decision: pendingBulkDecision,
      },
      {
        onSuccess: () => {
          setPendingBulkDecision(null);
          clearSelection();
        },
      }
    );
  };

  const handleViewResult = (result) => {
    router.push(`/assessments/${assessmentId}/results/${result.id}`);
  };

  if (isLoading || summaryLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Unable to load results</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Assessment Results
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          {assessmentTitle || "Assessment Results"}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Track candidate progress, scores, rankings, and shortlisting decisions.
        </p>
      </div>

      <ResultSummary summary={summary} />

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Candidate Results
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            View candidate rankings, assessment scores, and hiring decisions.
          </p>
        </div>

        <ResultFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          decision={decision}
          onDecisionChange={setDecision}
        />

        <BulkResultActions
          selectedCount={selectedResultIds.length}
          onClear={clearSelection}
          onShortlist={() =>
            setPendingBulkDecision(CANDIDATE_DECISION.SHORTLISTED)
          }
          onReject={() =>
            setPendingBulkDecision(CANDIDATE_DECISION.REJECTED)
          }
          isUpdating={bulkDecision.isPending}
        />

        {bulkDecision.isError && (
          <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-4">
            <p className="text-sm font-medium text-destructive">
              {bulkDecision.error?.message ?? "Unable to update candidate decisions."}
            </p>
          </div>
        )}

        <ResultsTable
          results={filteredResults}
          selectedResultIds={selectedResultIds}
          onToggleSelection={toggleResultSelection}
          onToggleAll={handleToggleAll}
          areAllSelected={areAllSelected}
          onViewResult={handleViewResult}
        />
      </section>

      {/* Bulk Action Confirmation Dialog */}
      <AlertDialog
        open={Boolean(pendingBulkDecision)}
        onOpenChange={(open) => {
          if (!open) setPendingBulkDecision(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingBulkDecision === CANDIDATE_DECISION.SHORTLISTED
                ? `Shortlist ${selectedResultIds.length} ${
                    selectedResultIds.length === 1 ? "candidate" : "candidates"
                  }?`
                : `Reject ${selectedResultIds.length} ${
                    selectedResultIds.length === 1 ? "candidate" : "candidates"
                  }?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingBulkDecision === CANDIDATE_DECISION.SHORTLISTED
                ? `${selectedResultIds.length} selected ${
                    selectedResultIds.length === 1 ? "candidate" : "candidates"
                  } will be marked as Shortlisted.`
                : `${selectedResultIds.length} selected ${
                    selectedResultIds.length === 1 ? "candidate" : "candidates"
                  } will be marked as Rejected.`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDecision.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleConfirmBulkDecision();
              }}
              disabled={bulkDecision.isPending}
            >
              {bulkDecision.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : pendingBulkDecision === CANDIDATE_DECISION.SHORTLISTED ? (
                "Shortlist Candidates"
              ) : (
                "Reject Candidates"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AssessmentResults;
