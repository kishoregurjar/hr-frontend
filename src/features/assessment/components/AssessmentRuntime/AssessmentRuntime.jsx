"use client";

import AssessmentNavigation from "../AssessmentNavigation";
import AssessmentProgress from "../AssessmentProgress";
import AssessmentRuntimeHeader from "../AssessmentRuntimeHeader";
import AssessmentSection from "../AssessmentSection";

import { buildRuntimeSections } from "../../utils";
import { useUpdateAttemptProgress } from "../../hooks";

const AssessmentRuntime = ({ assessment, attempt, onReview }) => {
  const sections = buildRuntimeSections(assessment);
  const updateProgress = useUpdateAttemptProgress();

  // Clamp currentSection to valid range
  const currentIndex = Math.min(
    Math.max(attempt.currentSection ?? 0, 0),
    Math.max(sections.length - 1, 0)
  );

  const currentSection = sections[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === sections.length - 1;
  const handlesOwnNavigation =
    currentSection?.type === "quiz" || currentSection?.type === "game";

  const changeSection = (nextIndex) => {
    if (nextIndex < 0 || nextIndex >= sections.length) return;

    updateProgress.mutate({
      attemptId: attempt.id,
      currentSection: nextIndex,
    });
  };

  const handlePrevious = () => changeSection(currentIndex - 1);

  const handleNext = () => {
    if (isLast) {
      onReview?.();
      return;
    }
    changeSection(currentIndex + 1);
  };

  const handleSectionComplete = () => {
    if (isLast) {
      onReview?.();
      return;
    }
    changeSection(currentIndex + 1);
  };

  // Edge case: assessment has no sections
  if (sections.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-2xl font-semibold">Assessment unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This assessment does not contain any sections.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AssessmentRuntimeHeader
        title={assessment.title}
        status={attempt.status}
      />

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        {/* Progress */}
        <AssessmentProgress
          current={currentIndex + 1}
          total={sections.length}
        />

        {/* Section label */}
        <p className="text-sm font-medium text-muted-foreground">
          Section {currentIndex + 1} of {sections.length}
        </p>

        {/* Section content */}
        <AssessmentSection
          section={currentSection}
          attempt={attempt}
          onSectionComplete={handleSectionComplete}
        />

        {/* Error */}
        {updateProgress.isError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">
              Unable to save progress. Please try again.
            </p>
          </div>
        )}

        {/* Navigation — Quiz and Game runtimes handle their own internal navigation */}
        {!handlesOwnNavigation && (
          <AssessmentNavigation
            isFirst={isFirst}
            isLast={isLast}
            onPrevious={handlePrevious}
            onNext={handleNext}
            isUpdating={updateProgress.isPending}
          />
        )}
      </main>
    </div>
  );
};

export default AssessmentRuntime;
