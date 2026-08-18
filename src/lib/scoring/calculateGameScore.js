export const calculateGameScore = ({ section, result }) => {
  if (!result) {
    return {
      score: 0,
      rawScore: null,
      accuracy: null,
    };
  }

  const normalizedScore = Number(result.normalizedScore ?? result.score);

  const score = Number.isFinite(normalizedScore)
    ? Math.min(100, Math.max(0, normalizedScore))
    : 0;

  return {
    score,
    rawScore: result.rawScore ?? result.score ?? null,
    accuracy: result.accuracy ?? null,
  };
};
