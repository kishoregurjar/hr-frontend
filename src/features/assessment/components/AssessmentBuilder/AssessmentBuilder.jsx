"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Copy, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  const [publishedSuccessData, setPublishedSuccessData] = useState(null);

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
    setSelectionErrors((previous) => ({
      ...previous,
      games: "",
    }));
    nextStep();
  };

  const handleQuestionSelectionChange = (selectedIds) => {
    updateAssessment({ selectedQuestionIds: selectedIds });

    if (selectedIds.length > 0 || (assessment.selectedGameIds?.length || 0) > 0) {
      setSelectionErrors((previous) => ({
        ...previous,
        questions: "",
      }));
    }
  };

  const handleQuestionsContinue = () => {
    const hasGames = (assessment.selectedGameIds?.length || 0) > 0;
    const hasQuestions = (assessment.selectedQuestionIds?.length || 0) > 0;

    if (!hasGames && !hasQuestions) {
      setSelectionErrors((previous) => ({
        ...previous,
        questions: "Select at least one game OR at least one question to continue.",
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
      onSuccess: (res) => {
        clearAssessmentDraft();
        const createdItem = res?.data || res || {};
        const createdId = createdItem.id || assessmentId;

        if (status === ASSESSMENT_STATUS.PUBLISHED || action === "publish") {
          toast.success("Assessment created and published successfully!");
          setPublishedSuccessData({
            id: createdId,
            title: payload.title || assessment.title,
          });
        } else {
          toast.success("Assessment saved as draft successfully!");
          router.push("/assessments");
        }
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
          selectedGameIds={assessment.selectedGameIds}
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

      {/* ── Post-Publish Quick Actions Dialog ── */}
      {publishedSuccessData && (
        <Dialog
          open={Boolean(publishedSuccessData)}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setPublishedSuccessData(null);
              router.push("/assessments");
            }
          }}
        >
          <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl border border-slate-200/90 shadow-2xl font-sans bg-white">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 text-white text-center relative">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mb-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              </div>
              <DialogTitle className="text-xl font-black text-white">
                Assessment Published!
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-300 mt-1">
                <span className="font-bold text-white">{publishedSuccessData.title}</span> is now live and ready for candidate evaluations.
              </DialogDescription>
            </div>

            <div className="p-6 space-y-4">
              {/* Copy Test Link */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Direct Candidate Test Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/take-test?assessmentId=${publishedSuccessData.id || ""}`}
                    className="flex-1 h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 select-all"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/take-test?assessmentId=${publishedSuccessData.id || ""}`
                      );
                      toast.success("Test link copied to clipboard!");
                    }}
                    className="h-10 px-3.5 rounded-xl border-slate-200 font-bold text-xs gap-1.5 cursor-pointer hover:bg-slate-50"
                  >
                    <Copy className="h-3.5 w-3.5 text-slate-600" />
                    Copy
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setPublishedSuccessData(null);
                    if (typeof window !== "undefined") {
                      window.location.href = "/assessments";
                    } else {
                      router.push("/assessments");
                    }
                  }}
                  className="h-11 rounded-xl border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  All Assessments
                </Button>

                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const targetId = publishedSuccessData?.id || publishedSuccessData?._id || "";
                    setPublishedSuccessData(null);
                    const targetUrl = targetId ? `/invitations?assessmentId=${targetId}` : "/invitations";
                    if (typeof window !== "undefined") {
                      window.location.href = targetUrl;
                    } else {
                      router.push(targetUrl);
                    }
                  }}
                  className="h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  Invite Candidates
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AssessmentBuilder;
