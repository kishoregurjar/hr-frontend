import { getAllCompanyGameConfigs } from "@/features/games/utils/gameConfigStore";

const safeNum = (val, fallback) => {
  const n = Number(val);
  return isNaN(n) ? fallback : n;
};

export const toAssessmentPayload = (assessment, status) => {
  const duration = safeNum(assessment.duration ?? assessment.durationMinutes, 60);
  const passingScore = safeNum(assessment.passingScore, 10);
  const maximumScore = safeNum(assessment.maximumScore, 100);
  const maxAttempts = safeNum(assessment.attemptsAllowed ?? assessment.maxAttempts, 1);

  // Compute dominant difficulty from configured games if not explicitly set
  let resolvedDifficulty = assessment.difficulty;
  if (!resolvedDifficulty) {
    try {
      const selectedIds = [
        ...(assessment.selectedGameIds || assessment.gameIds || assessment.games || []),
      ].map((g) => (typeof g === "object" ? g.slug || g.gameId || g.id : g)).filter(Boolean);

      const allConfigs = getAllCompanyGameConfigs();
      for (const id of selectedIds) {
        const key = String(id).toLowerCase();
        const conf = allConfigs[key] || allConfigs[id];
        if (conf?.difficulty) {
          resolvedDifficulty = conf.difficulty;
          break;
        }
      }
    } catch {}
  }

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
    difficulty: (resolvedDifficulty || "MEDIUM").toUpperCase(),
    shuffleQuestions: Boolean(assessment.shuffleQuestions ?? true),
    showResultToCandidate: Boolean(assessment.showResultToCandidate ?? false),

    gameIds: [...(assessment.selectedGameIds || assessment.gameIds || assessment.games || [])].map(g => typeof g === "object" ? (g.gameId || g.id) : g).filter(Boolean),
    games: [...(assessment.selectedGameIds || assessment.gameIds || assessment.games || [])].map(g => typeof g === "object" ? (g.gameId || g.id) : g).filter(Boolean),
    questionIds: [...(assessment.selectedQuestionIds || assessment.questionIds || assessment.questions || [])].map(q => typeof q === "object" ? (q.questionId || q.id) : q).filter(Boolean),
    questions: [...(assessment.selectedQuestionIds || assessment.questionIds || assessment.questions || [])].map(q => typeof q === "object" ? (q.questionId || q.id) : q).filter(Boolean),
  };
};

export const toAssessmentBuilder = (assessment) => {
  if (!assessment) return {};

  const extractedQuestionIds =
    (Array.isArray(assessment.questionIds) && assessment.questionIds.length > 0
      ? assessment.questionIds
      : null) ||
    (Array.isArray(assessment.questions)
      ? assessment.questions
        .map((q) => q?.questionId || q?.id || q?._id)
        .filter(Boolean)
      : null) ||
    (Array.isArray(assessment.AssessmentQuestions)
      ? assessment.AssessmentQuestions
        .map((q) => q?.questionId || q?.id)
        .filter(Boolean)
      : null) ||
    [];

  const extractedGameIds =
    (Array.isArray(assessment.gameIds) && assessment.gameIds.length > 0
      ? assessment.gameIds
      : null) ||
    (Array.isArray(assessment.games)
      ? assessment.games
        .map((g) => g?.gameId || g?.id || g?._id)
        .filter(Boolean)
      : null) ||
    (Array.isArray(assessment.AssessmentGames)
      ? assessment.AssessmentGames
        .map((g) => g?.gameId || g?.id)
        .filter(Boolean)
      : null) ||
    [];

  return {
    title: assessment.title ?? "",
    description: assessment.description ?? "",
    selectedGameIds: extractedGameIds,
    selectedQuestionIds: extractedQuestionIds,
    duration: assessment.duration ?? assessment.durationMinutes ?? 60,
    passingScore: assessment.passingScore ?? 70,
    attemptsAllowed: assessment.attemptsAllowed ?? 1,
    difficulty: assessment.difficulty || "MEDIUM",
    shuffleQuestions: assessment.shuffleQuestions ?? true,
    showResultToCandidate: assessment.showResultToCandidate ?? false,
  };
};
