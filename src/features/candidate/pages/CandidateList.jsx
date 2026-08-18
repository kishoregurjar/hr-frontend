"use client";

import { useMemo, useState } from "react";
import { Plus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  AddCandidateDialog,
  AssignAssessmentDialog,
  CandidateBulkActions,
  CandidateFilters,
  CandidateTable,
  ImportCandidatesDialog,
} from "../components";
import { useCandidatesQuery } from "../hooks";

const CandidateList = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const {
    data: candidates = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useCandidatesQuery();

  const filteredCandidates = useMemo(() => {
    const query = search.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const name = candidate.name?.toLowerCase() ?? "";
      const email = candidate.email?.toLowerCase() ?? "";
      const phone = candidate.phone?.toLowerCase() ?? "";

      const matchesSearch =
        !query ||
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query);

      const matchesStatus =
        status === "all" || candidate.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [candidates, search, status]);

  const selectedCandidates = useMemo(() => {
    return candidates.filter((candidate) =>
      selectedIds.some(
        (id) => String(id) === String(candidate.id)
      )
    );
  }, [candidates, selectedIds]);

  const handleToggleCandidate = (candidateId) => {
    setSelectedIds((current) => {
      const isSelected = current.some(
        (id) => String(id) === String(candidateId)
      );

      if (isSelected) {
        return current.filter(
          (id) => String(id) !== String(candidateId)
        );
      }

      return [...current, candidateId];
    });
  };

  const handleToggleAll = () => {
    const visibleIds = filteredCandidates.map((candidate) => candidate.id);

    const areAllSelected =
      visibleIds.length > 0 &&
      visibleIds.every((candidateId) =>
        selectedIds.some(
          (selectedId) => String(selectedId) === String(candidateId)
        )
      );

    if (areAllSelected) {
      setSelectedIds((current) =>
        current.filter(
          (selectedId) =>
            !visibleIds.some(
              (visibleId) => String(visibleId) === String(selectedId)
            )
        )
      );
      return;
    }

    setSelectedIds((current) => {
      const next = [...current];

      visibleIds.forEach((candidateId) => {
        const exists = next.some(
          (id) => String(id) === String(candidateId)
        );

        if (!exists) {
          next.push(candidateId);
        }
      });

      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("all");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Candidates
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage candidates participating in your hiring assessments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ImportCandidatesDialog existingCandidates={candidates} />
          <AddCandidateDialog />
        </div>
      </div>

      {/* Filters Toolbar */}
      {!isLoading && !isError && candidates.length > 0 && (
        <CandidateFilters
          search={search}
          status={status}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onClear={handleClearFilters}
        />
      )}

      {/* Counter */}
      {!isLoading && !isError && candidates.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {filteredCandidates.length}
          </span>{" "}
          of {candidates.length} candidates
          {selectedCandidates.length > 0 && (
            <>
              {" "}•{" "}
              <span className="font-medium text-foreground">
                {selectedCandidates.length}
              </span>{" "}
              selected
            </>
          )}
        </p>
      )}

      {/* Bulk Action Bar */}
      <CandidateBulkActions
        selectedCount={selectedCandidates.length}
        onClear={handleClearSelection}
        onAssignAssessment={() => setIsAssignDialogOpen(true)}
      />

      {/* Loading state */}
      {isLoading && (
        <div className="rounded-xl border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Loading candidates...
          </p>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="rounded-xl border border-destructive/50 p-12 text-center">
          <h2 className="font-semibold">Unable to load candidates</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {error?.message || "Something went wrong."}
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => refetch()}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Empty state A: 0 candidates exist */}
      {!isLoading && !isError && candidates.length === 0 && (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <Users className="mx-auto h-10 w-10 text-muted-foreground" />

          <h2 className="mt-4 text-lg font-semibold">
            No candidates yet
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Add candidates to start your hiring assessment process.
          </p>

          <div className="mt-4 flex justify-center gap-2">
            <ImportCandidatesDialog existingCandidates={candidates} />
            <AddCandidateDialog
              trigger={
                <Button type="button">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Candidate
                </Button>
              }
            />
          </div>
        </div>
      )}

      {/* Empty state B: Candidates exist but search/filter returned 0 results */}
      {!isLoading &&
        !isError &&
        candidates.length > 0 &&
        filteredCandidates.length === 0 && (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <h2 className="text-lg font-semibold">
              No matching candidates
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Try changing your search or status filter.
            </p>

            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          </div>
        )}

      {/* Table */}
      {!isLoading && !isError && filteredCandidates.length > 0 && (
        <CandidateTable
          candidates={filteredCandidates}
          selectedIds={selectedIds}
          onToggleCandidate={handleToggleCandidate}
          onToggleAll={handleToggleAll}
        />
      )}

      {/* Assign Assessment Dialog */}
      <AssignAssessmentDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        candidates={selectedCandidates}
        onAssigned={handleClearSelection}
      />
    </div>
  );
};

export default CandidateList;
