"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssessmentsQuery } from "@/features/assessment/hooks";
import { AssessmentStatusBadge } from "@/features/assessment/components";
import {
  formatAssessmentDate,
  getRecentAssessments,
} from "@/features/assessment/utils";

const RecentAssessments = () => {
  const {
    data: assessments = [],
    isLoading,
    isError,
  } = useAssessmentsQuery();

  const recentAssessments = useMemo(
    () => getRecentAssessments(assessments, 5),
    [assessments]
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Assessments</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="flex justify-between items-center py-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-28" />
              </div>

              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-lg">
            Recent Assessments
          </CardTitle>

          <Link href="/assessments">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        {recentAssessments.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No assessments yet.
            </p>

            <Link href="/assessments/create">
              <Button variant="outline" size="sm" className="mt-4">
                Create Assessment
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {recentAssessments.map((assessment) => (
              <div
                key={assessment.id}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <Link
                    href={`/assessments/${assessment.id}`}
                    className="font-medium hover:underline"
                  >
                    {assessment.title}
                  </Link>

                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {formatAssessmentDate(
                      assessment.updatedAt ?? assessment.createdAt
                    )}
                  </div>
                </div>

                <AssessmentStatusBadge status={assessment.status} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentAssessments;
