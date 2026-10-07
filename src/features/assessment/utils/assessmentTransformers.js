import { getAllCompanyGameConfigs, getCompanyGameConfig } from "@/features/games/utils/gameConfigStore";

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
  if (!resolvedDifficulty || resolvedDifficulty === "MEDIUM") {
    try {
      const allGames = [
        ...(assessment.selectedGameIds || assessment.gameIds || assessment.games || []),
      ];

      for (const g of allGames) {
        if (typeof g === "object" && g?.config?.difficulty) {
          resolvedDifficulty = g.config.difficulty;
          break;
        }
      }

      if (!resolvedDifficulty) {
        const allConfigs = getAllCompanyGameConfigs();
        for (const g of allGames) {
          const id = typeof g === "object" ? g.slug || g.gameId || g.id : g;
          if (!id) continue;
          
          const key = String(id).toLowerCase();
          const conf = allConfigs[key] || allConfigs[id];
          if (conf?.difficulty) {
            resolvedDifficulty = conf.difficulty;
            break;
          }
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

    gameIds: [...(assessment.selectedGameIds || assessment.gameIds || assessment.games || [])]
      .filter(Boolean)
      .map((g) => {
        if (typeof g === "object") {
          return { id: g.gameId || g.id || g._id, config: g.config || null };
        }
        return g; // primitive
      })
      .filter((g) => typeof g === "object" ? Boolean(g.id) : Boolean(g)),
    games: [...(assessment.selectedGameIds || assessment.gameIds || assessment.games || [])]
      .filter(Boolean)
      .map((g) => {
        if (typeof g === "object") {
          return { id: g.gameId || g.id || g._id, config: g.config || null };
        }
        return g; // primitive
      })
      .filter((g) => typeof g === "object" ? Boolean(g.id) : Boolean(g)),
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

  const extractGameIdsWithConfig = (gamesArray) => {
    return gamesArray
      .map((g) => {
        if (!g) return null;
        if (typeof g === "object") {
          const id = g.gameId || g.id || g._id;
          if (!id) return null;
          return { id, config: g.config || null };
        }
        return g;
      })
      .filter(Boolean);
  };

  const extractedGameIds =
    (Array.isArray(assessment.gameIds) && assessment.gameIds.length > 0
      ? extractGameIdsWithConfig(assessment.gameIds)
      : null) ||
    (Array.isArray(assessment.games)
      ? extractGameIdsWithConfig(assessment.games)
      : null) ||
    (Array.isArray(assessment.AssessmentGames)
      ? extractGameIdsWithConfig(assessment.AssessmentGames)
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
