export const validateScoringConfig = (scoring) => {
  if (!scoring) return false;

  const quizWeight = Number(scoring.quizWeight);
  const gameWeight = Number(scoring.gameWeight);

  if (!Number.isFinite(quizWeight) || !Number.isFinite(gameWeight)) {
    return false;
  }

  if (quizWeight < 0 || gameWeight < 0) {
    return false;
  }

  return quizWeight + gameWeight === 100;
};
