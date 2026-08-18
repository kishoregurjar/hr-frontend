export const calculateAttemptScore = (responses = []) => {
  if (!Array.isArray(responses) || responses.length === 0) {
    return {
      score: 0,
      maxScore: 0,
      percentage: 0,
    };
  }

  const score = responses.reduce(
    (total, response) => total + Number(response.score ?? 0),
    0
  );

  const maxScore = responses.reduce(
    (total, response) => total + Number(response.maxScore ?? 0),
    0
  );

  const percentage =
    maxScore > 0 ? Number(((score / maxScore) * 100).toFixed(2)) : 0;

  return {
    score,
    maxScore,
    percentage,
  };
};
