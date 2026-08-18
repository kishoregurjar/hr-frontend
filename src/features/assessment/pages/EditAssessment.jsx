"use client";

import { ASSESSMENT_STATUS } from "../constants";
import { AssessmentBuilder } from "../components";
import { useAssessmentQuery } from "../hooks";
import { toAssessmentBuilder } from "../utils";

const EditAssessment = ({ assessmentId }) => {
  const {
    data: assessment,
    isLoading,
    isError,
    error,
  } = useAssessmentQuery(assessmentId);

  if (isLoading) {
    return (
      <div className="rounded-xl border p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Loading assessment...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/50 p-12 text-center">
        <h2 className="font-semibold">
          Unable to load assessment
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          {error?.message || "Assessment not found."}
        </p>
      </div>
    );
  }

  if (assessment?.status === ASSESSMENT_STATUS.ARCHIVED) {
    return (
      <div className="rounded-xl border p-12 text-center">
        <h2 className="text-lg font-semibold">
          Assessment is archived
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Restore this assessment before editing it.
        </p>
      </div>
    );
  }

  const initialAssessment = toAssessmentBuilder(assessment);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Edit Assessment
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Update assessment details, content, and candidate settings.
        </p>
      </div>

      <AssessmentBuilder
        mode="edit"
        assessmentId={assessmentId}
        initialAssessment={initialAssessment}
      />
    </div>
  );
};

export default EditAssessment;
