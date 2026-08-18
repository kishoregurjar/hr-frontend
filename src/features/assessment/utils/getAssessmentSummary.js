/**
 * Returns a summary of games, quizzes/questions and total sections
 * from an assessment object.
 *
 * Supports both:
 *   assessment.gameIds / assessment.questionIds  (new in-memory API model)
 *   assessment.games / assessment.quizzes        (legacy data model)
 */
export const getAssessmentSummary = (assessment) => {
  const games =
    assessment?.gameIds?.length ??
    assessment?.games?.length ??
    0;

  const quizzes =
    assessment?.questionIds?.length ??
    assessment?.quizzes?.length ??
    0;

  return {
    games,
    quizzes,
    totalSections: games + quizzes,
  };
};
