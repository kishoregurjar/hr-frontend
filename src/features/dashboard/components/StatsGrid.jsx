"use client";

import { useMemo } from "react";

import { useAssessmentsQuery } from "@/features/assessment/hooks";
import { getAssessmentStats } from "@/features/assessment/utils";

import AssessmentStats from "./AssessmentStats";
import DashboardStatsSkeleton from "./DashboardStatsSkeleton";

const StatsGrid = () => {
  const {
    data: assessments = [],
    isLoading,
    isError,
  } = useAssessmentsQuery();

  const stats = useMemo(
    () => getAssessmentStats(assessments),
    [assessments]
  );

  if (isLoading) {
    return <DashboardStatsSkeleton />;
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/50 p-8 text-center">
        <h2 className="font-semibold">Unable to load assessment stats</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Assessment information could not be loaded.
        </p>
      </div>
    );
  }

  return <AssessmentStats stats={stats} />;
};

export default StatsGrid;
