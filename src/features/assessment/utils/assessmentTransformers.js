export const toAssessmentPayload = (assessment, status) => {
  return {
    title: assessment.title.trim(),

    description: assessment.description?.trim() ?? "",

    status,

    duration: Number(assessment.duration),

    passingScore: Number(assessment.passingScore),

    attemptsAllowed: Number(assessment.attemptsAllowed),

    shuffleQuestions: Boolean(assessment.shuffleQuestions),

    showResultToCandidate: Boolean(assessment.showResultToCandidate),

    gameIds: [...assessment.selectedGameIds],

    questionIds: [...assessment.selectedQuestionIds],
  };
};

export const toAssessmentBuilder = (assessment) => {
  if (!assessment) return {};

  return {
    title: assessment.title ?? "",

    description: assessment.description ?? "",

    selectedGameIds: assessment.gameIds ?? [],

    selectedQuestionIds: assessment.questionIds ?? [],

    duration: assessment.duration ?? 60,

    passingScore: assessment.passingScore ?? 70,

    attemptsAllowed: assessment.attemptsAllowed ?? 1,

    shuffleQuestions: assessment.shuffleQuestions ?? true,

    showResultToCandidate: assessment.showResultToCandidate ?? false,
  };
};
