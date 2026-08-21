const safeNum = (val, fallback) => {
  const n = Number(val);
  return isNaN(n) ? fallback : n;
};

export const toAssessmentPayload = (assessment, status) => {
  const duration = safeNum(assessment.duration ?? assessment.durationMinutes, 60);
  const passingScore = safeNum(assessment.passingScore, 10);
  const maximumScore = safeNum(assessment.maximumScore, 100);
  const maxAttempts = safeNum(assessment.attemptsAllowed ?? assessment.maxAttempts, 1);

  return {
    title: assessment.title?.trim() ?? "",
    description: assessment.description?.trim() || null,
    instructions: assessment.instructions?.trim() || null,
    status,

    // Numbers (Guaranteed 100% NaN-Safe with Defaults)
    duration,
    durationMinutes: duration,
    passingScore,
    maximumScore,
    attemptsAllowed: maxAttempts,
    maxAttempts,

    // Enums & Flags
    type: assessment.type || "TECHNICAL",
    difficulty: (assessment.difficulty || "MEDIUM").toUpperCase(),
    shuffleQuestions: Boolean(assessment.shuffleQuestions ?? true),
    showResultToCandidate: Boolean(assessment.showResultToCandidate ?? false),

    gameIds: [...(assessment.selectedGameIds || assessment.gameIds || [])],
    questionIds: [...(assessment.selectedQuestionIds || assessment.questionIds || [])],
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
