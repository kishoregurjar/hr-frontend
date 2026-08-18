"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { games as staticGames } from "@/features/games/data";
import { useQuestionsQuery } from "@/features/question-bank/hooks";

import { ASSESSMENT_STATUS } from "../constants";
import {
  AssessmentDetails,
  AssessmentStatusActions,
} from "../components";
import {
  useAssessmentQuery,
  useAssessmentStatusMutation,
} from "../hooks";

const AssessmentDetailsPage = ({ assessmentId }) => {
  const router = useRouter();

  const {
    data: assessment,
    isLoading: isAssessmentLoading,
    isError: isAssessmentError,
    error,
  } = useAssessmentQuery(assessmentId);

  const {
    data: questions = [],
    isLoading: isQuestionsLoading,
  } = useQuestionsQuery();

  const statusMutation = useAssessmentStatusMutation();

  const handlePublish = () => {
    statusMutation.mutate({
      id: assessmentId,
      status: ASSESSMENT_STATUS.PUBLISHED,
    });
  };

  const handleArchive = () => {
    statusMutation.mutate({
      id: assessmentId,
      status: ASSESSMENT_STATUS.ARCHIVED,
    });
  };

  const handleRestore = () => {
    statusMutation.mutate({
      id: assessmentId,
      status: ASSESSMENT_STATUS.PUBLISHED,
    });
  };

  const isLoading = isAssessmentLoading || isQuestionsLoading;

  if (isLoading) {
    return (
      <div className="rounded-xl border p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Loading assessment...
        </p>
      </div>
    );
  }

  if (isAssessmentError) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => router.push("/assessments")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assessments
        </Button>

        <div className="rounded-xl border border-destructive/50 p-12 text-center">
          <h2 className="text-lg font-semibold">
            Unable to load assessment
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {error?.message || "The assessment could not be found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push("/assessments")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Assessments
        </Button>
      </div>

      {statusMutation.isError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">
            {statusMutation.error?.message ||
              "Unable to update assessment status."}
          </p>
        </div>
      )}

      <AssessmentDetails
        assessment={assessment}
        games={staticGames}
        questions={questions}
        actions={
          <>
            {assessment.status !== ASSESSMENT_STATUS.ARCHIVED && (
              <Link href={`/assessments/${assessmentId}/edit`}>
                <Button variant="outline">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Assessment
                </Button>
              </Link>
            )}

            <AssessmentStatusActions
              status={assessment.status}
              onPublish={handlePublish}
              onArchive={handleArchive}
              onRestore={handleRestore}
              isPending={statusMutation.isPending}
            />
          </>
        }
      />
    </div>
  );
};

export default AssessmentDetailsPage;
