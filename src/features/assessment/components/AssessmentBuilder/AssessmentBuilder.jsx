"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useGamesQuery } from "@/features/games/hooks";
import { useQuestionsQuery } from "@/features/question-bank/hooks";
import { QUESTION_STATUS } from "@/features/question-bank/constants";

import { ASSESSMENT_STATUS } from "../../constants";
import {
  useAssessmentBuilder,
  useCreateAssessment,
  useUpdateAssessment,
} from "../../hooks";
import {
  clearAssessmentDraft,
  getAssessmentDraft,
  hasAssessmentProgress,
  saveAssessmentDraft,
  toAssessmentPayload,
  validateAssessment,
} from "../../utils";

import AssessmentStepper from "../AssessmentStepper";
import AssessmentDetailsForm from "../AssessmentDetailsForm";
import GameSelectionStep from "../GameSelectionStep";
import QuestionSelectionStep from "../QuestionSelectionStep";
import AssessmentSettingsForm from "../AssessmentSettingsForm";
import AssessmentReview from "../AssessmentReview";
import AssessmentDraftRecovery from "../AssessmentDraftRecovery";

const AssessmentBuilder = ({
  mode = "create",
  assessmentId = null,
  initialAssessment,
}) => {
  const router = useRouter();
  const [submitAction, setSubmitAction] = useState(null);

  const {
    data: allGames = [],
    isLoading: isGamesLoading,
    isError: isGamesError,
  } = useGamesQuery();

  const games = (Array.isArray(allGames) ? allGames : []).filter(
    (g) => g.isActive !== false && g.status !== "INACTIVE"
  );

  const [selectionErrors, setSelectionErrors] = useState({
    games: "",
    questions: "",
  });

  const [finalValidationErrors, setFinalValidationErrors] = useState({});

  const [recoveryDraft, setRecoveryDraft] = useState(null);
  const [hasCheckedDraft, setHasCheckedDraft] = useState(false);
  const canAutoSaveRef = useRef(false);

  const isEditMode = mode === "edit";

  const {
    currentStep,
    assessment,
    updateAssessment,
    replaceAssessment,
    previousStep,
    nextStep,
    goToStep,
  } = useAssessmentBuilder({ initialAssessment });

  const createAssessment = useCreateAssessment();
  const updateAssessmentMutation = useUpdateAssessment();

  // Check for existing temporary draft on create mode mount
  useEffect(() => {
    if (mode !== "create") {
      setHasCheckedDraft(true);
      canAutoSaveRef.current = true;
      return;
    }

    const draft = getAssessmentDraft();

    if (draft?.assessment) {
      setRecoveryDraft(draft);
    } else {
      canAutoSaveRef.current = true;
    }

    setHasCheckedDraft(true);
  }, [mode]);

  // Auto-save draft when assessment or step changes in create mode
  useEffect(() => {
    if (mode !== "create") {
      return;
    }

    if (!hasCheckedDraft) {
      return;
    }

    if (!canAutoSaveRef.current) {
      return;
    }

    if (!hasAssessmentProgress(assessment)) {
      return;
    }

    saveAssessmentDraft(assessment, currentStep);
  }, [assessment, currentStep, mode, hasCheckedDraft]);

  const handleRestoreDraft = () => {
    if (!recoveryDraft) {
      return;
    }

    replaceAssessment(recoveryDraft.assessment);

    if (
      recoveryDraft.currentStep >= 1 &&
      recoveryDraft.currentStep <= 5
    ) {
      goToStep(recoveryDraft.currentStep);
    }

    setRecoveryDraft(null);
    canAutoSaveRef.current = true;
  };

  const handleDiscardDraft = () => {
    clearAssessmentDraft();
    setRecoveryDraft(null);
    canAutoSaveRef.current = true;
  };

  // Questions from existing Question Bank — same source of truth
  const {
    data: questions = [],
    isLoading: isQuestionsLoading,
    isError: isQuestionsError,
  } = useQuestionsQuery();

  // Questions selectable in assessments (Active, Published, or fallback to all questions)
  const availableQuestions = questions.filter(
    (question) =>
      !question.status ||
      question.status === QUESTION_STATUS.ACTIVE ||
      question.status === "Published" ||
      question.status === "PUBLISHED" ||
      question.status === "Active"
  );

  const selectableQuestions =
    availableQuestions.length > 0 ? availableQuestions : questions;

  const isSubmitting =
    createAssessment.isPending || updateAssessmentMutation.isPending;

  const submitError =
    createAssessment.error || updateAssessmentMutation.error;

  // ── Step Handlers ──────────────────────────────────────────────

  const handleDetailsContinue = (data) => {
    updateAssessment(data);
    nextStep();
  };

  const handleGameSelectionChange = (selectedIds) => {
    updateAssessment({ selectedGameIds: selectedIds });

    if (selectedIds.length > 0) {
      setSelectionErrors((previous) => ({
        ...previous,
        games: "",
      }));
    }
  };

  const handleGamesContinue = () => {
    if (assessment.selectedGameIds.length === 0) {
      setSelectionErrors((previous) => ({
        ...previous,
        games: "Select at least one game to continue.",
      }));
      return;
    }

    setSelectionErrors((previous) => ({
      ...previous,
      games: "",
    }));

    nextStep();
  };

  const handleQuestionSelectionChange = (selectedIds) => {
    updateAssessment({ selectedQuestionIds: selectedIds });

    if (selectedIds.length > 0) {
      setSelectionErrors((previous) => ({
        ...previous,
        questions: "",
      }));
    }
  };

  const handleQuestionsContinue = () => {
    if (assessment.selectedQuestionIds.length === 0) {
      setSelectionErrors((previous) => ({
        ...previous,
        questions: "Select at least one question to continue.",
      }));
      return;
    }

    setSelectionErrors((previous) => ({
      ...previous,
      questions: "",
    }));

    nextStep();
  };

  const handleSettingsContinue = (data) => {
    updateAssessment(data);
    nextStep();
  };

  const handleSubmitAssessment = (status, action) => {
    if (isSubmitting) {
      return;
    }

    const payload = toAssessmentPayload(assessment, status);
    setSubmitAction(action);

    if (isEditMode) {
      updateAssessmentMutation.mutate(
        {
          id: assessmentId,
          payload,
        },
        {
          onSuccess: () => {
            router.push(`/assessments/${assessmentId}`);
          },
          onSettled: () => {
            setSubmitAction(null);
          },
        }
      );
      return;
    }

    createAssessment.mutate(payload, {
      onSuccess: () => {
        clearAssessmentDraft();
        router.push("/assessments");
      },
      onSettled: () => {
        setSubmitAction(null);
      },
    });
  };

  const handleSaveDraft = () => {
    handleSubmitAssessment(ASSESSMENT_STATUS.DRAFT, "draft");
  };

  const handlePublish = () => {
    const validation = validateAssessment(assessment);
    const errors = { ...validation.errors };

    const hasInvalidGameSelection = assessment.selectedGameIds.some(
      (id) => !games.some((game) => String(game.id || game._id) === String(id))
    );

    const hasInvalidQuestionSelection = assessment.selectedQuestionIds.some(
      (id) =>
        !questions.some((question) => String(question.id || question._id) === String(id))
    );

    if (hasInvalidGameSelection) {
      errors.selectedGameIds =
        "One or more selected games are no longer available.";
    }

    if (hasInvalidQuestionSelection) {
      errors.selectedQuestionIds =
        "One or more selected questions are no longer available.";
    }

    if (Object.keys(errors).length > 0) {
      setFinalValidationErrors(errors);
      return;
    }

    setFinalValidationErrors({});
    handleSubmitAssessment(ASSESSMENT_STATUS.PUBLISHED, "publish");
  };

  if (mode === "create" && recoveryDraft) {
    return (
      <AssessmentDraftRecovery
        draft={recoveryDraft}
        onRestore={handleRestoreDraft}
        onDiscard={handleDiscardDraft}
      />
    );
  }

  return (
    <div className="space-y-8">
      <AssessmentStepper currentStep={currentStep} />

      {/* ── Step 1: Details ── */}
      {currentStep === 1 && (
        <AssessmentDetailsForm
          defaultValues={assessment}
          onContinue={handleDetailsContinue}
        />
      )}

      {/* ── Step 2: Game Selection ── */}
      {currentStep === 2 && isGamesLoading && (
        <div className="rounded-xl border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Loading games...
          </p>
        </div>
      )}

      {currentStep === 2 && isGamesError && (
        <div className="rounded-xl border border-destructive/50 p-8 text-center">
          <h3 className="font-semibold">Unable to load games</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Games could not be loaded. Please try again.
          </p>
        </div>
      )}

      {currentStep === 2 && !isGamesLoading && !isGamesError && (
        <GameSelectionStep
          games={games}
          selectedGameIds={assessment.selectedGameIds}
          onSelectionChange={handleGameSelectionChange}
          onBack={previousStep}
          onContinue={handleGamesContinue}
          error={selectionErrors.games}
        />
      )}

      {/* ── Step 3: Question Selection ── */}
      {currentStep === 3 && isQuestionsLoading && (
        <div className="rounded-xl border p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Loading questions...
          </p>
        </div>
      )}

      {currentStep === 3 && isQuestionsError && (
        <div className="rounded-xl border border-destructive/50 p-10 text-center">
          <h3 className="font-semibold">Unable to load questions</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Questions could not be loaded. Please try again.
          </p>
        </div>
      )}

      {currentStep === 3 && !isQuestionsLoading && !isQuestionsError && (
        <QuestionSelectionStep
          questions={selectableQuestions}
          selectedQuestionIds={assessment.selectedQuestionIds}
          onSelectionChange={handleQuestionSelectionChange}
          onBack={previousStep}
          onContinue={handleQuestionsContinue}
          error={selectionErrors.questions}
        />
      )}

      {/* ── Step 4: Settings ── */}
      {currentStep === 4 && (
        <AssessmentSettingsForm
          defaultValues={assessment}
          onChange={(values) => updateAssessment(values)}
          onBack={previousStep}
          onContinue={handleSettingsContinue}
        />
      )}

      {/* ── Step 5: Review ── */}
      {currentStep === 5 && (
        <AssessmentReview
          assessment={assessment}
          games={games}
          questions={questions}
          onBack={previousStep}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
          isSubmitting={isSubmitting}
          submitAction={submitAction}
          error={submitError}
          validationErrors={finalValidationErrors}
        />
      )}
    </div>
  );
};

export default AssessmentBuilder;
