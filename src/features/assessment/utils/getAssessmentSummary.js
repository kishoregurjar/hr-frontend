export const getAssessmentSummary = (assessment) => {
  const gameCount =
    (Array.isArray(assessment?.games) ? assessment.games.length : undefined) ??
    (Array.isArray(assessment?.gameIds) ? assessment.gameIds.length : undefined) ??
    (Array.isArray(assessment?.selectedGameIds) ? assessment.selectedGameIds.length : undefined) ??
    (typeof assessment?.gameCount === "number" ? assessment.gameCount : undefined) ??
    0;

  const questionCount =
    (Array.isArray(assessment?.questions) ? assessment.questions.length : undefined) ??
    (Array.isArray(assessment?.questionIds) ? assessment.questionIds.length : undefined) ??
    (Array.isArray(assessment?.quizzes?.[0]?.questions) ? assessment.quizzes[0].questions.length : undefined) ??
    (Array.isArray(assessment?.quizzes) ? assessment.quizzes.length : undefined) ??
    (typeof assessment?.questionCount === "number" ? assessment.questionCount : undefined) ??
    0;

  const sequentialModules = (gameCount > 0 ? 1 : 0) + (questionCount > 0 ? 1 : 0);

  return {
    games: gameCount,
    quizzes: questionCount,
    gameCount,
    questionCount,
    totalSections: sequentialModules || (gameCount + questionCount > 0 ? 1 : 0),
  };
};
