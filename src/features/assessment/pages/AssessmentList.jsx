"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common";

import { ASSESSMENT_STATUS } from "../constants";
import {
  AssessmentCard,
  AssessmentCardSkeleton,
  AssessmentFilters,
} from "../components";
import {
  useAssessmentsQuery,
  useAssessmentStatusMutation,
} from "../hooks";

const AssessmentList = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [actionAssessmentId, setActionAssessmentId] = useState(null);

  const {
    data: assessments = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useAssessmentsQuery();

  const statusMutation = useAssessmentStatusMutation();

  const updateStatus = (id, newStatus) => {
    setActionAssessmentId(id);

    statusMutation.mutate(
      {
        id,
        status: newStatus,
      },
      {
        onSettled: () => {
          setActionAssessmentId(null);
        },
      }
    );
  };

  const handlePublish = (id) => {
    updateStatus(id, ASSESSMENT_STATUS.PUBLISHED);
  };

  const handleArchive = (id) => {
    updateStatus(id, ASSESSMENT_STATUS.ARCHIVED);
  };

  const handleRestore = (id) => {
    updateStatus(id, ASSESSMENT_STATUS.PUBLISHED);
  };

  const filteredAssessments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return assessments.filter((assessment) => {
      const title = assessment.title?.toLowerCase() ?? "";
      const description = assessment.description?.toLowerCase() ?? "";

      const matchesSearch =
        !query ||
        title.includes(query) ||
        description.includes(query);

      const matchesStatus =
        status === "all" || assessment.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [assessments, search, status]);

  const handleClearFilters = () => {
    setSearch("");
    setStatus("all");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessments"
        description="Create and manage hiring assessments for your candidates."
      >
        <Link href="/assessments/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Assessment
          </Button>
        </Link>
      </PageHeader>

      <AssessmentFilters
        search={search}
        status={status}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onClear={handleClearFilters}
      />

      {/* Top Error Alert for status action failures */}
      {statusMutation.isError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">
            {statusMutation.error?.message ||
              "Unable to update assessment."}
          </p>
        </div>
      )}

      {/* Result counter */}
      {!isLoading && !isError && assessments.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {filteredAssessments.length}
          </span>{" "}
          of {assessments.length} assessments
        </p>
      )}

      {/* Loading state: Card skeletons */}
      {isLoading && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <AssessmentCardSkeleton key={index} />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="rounded-xl border border-destructive/50 p-12 text-center">
          <h2 className="text-lg font-semibold">
            Unable to load assessments
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {error?.message ||
              "Something went wrong while loading assessments."}
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

      {/* Case A: Empty state — No assessments exist */}
      {!isLoading && !isError && assessments.length === 0 && (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <h2 className="text-lg font-semibold">
            No assessments yet
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Create your first assessment to get started.
          </p>
        </div>
      )}

      {/* Case B: Empty state — Assessments exist but filter returned 0 results */}
      {!isLoading &&
        !isError &&
        assessments.length > 0 &&
        filteredAssessments.length === 0 && (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <h2 className="text-lg font-semibold">
              No matching assessments
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

      {/* Assessment Grid */}
      {!isLoading && !isError && filteredAssessments.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredAssessments.map((assessment) => (
            <AssessmentCard
              key={assessment.id}
              assessment={assessment}
              onPublish={handlePublish}
              onArchive={handleArchive}
              onRestore={handleRestore}
              isPending={
                statusMutation.isPending &&
                actionAssessmentId === assessment.id
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AssessmentList;
