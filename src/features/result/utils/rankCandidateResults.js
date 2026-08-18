export const rankCandidateResults = (results = []) => {
  const completed = [...results]
    .filter(
      (result) => result.status === "Completed" && result.score != null
    )
    .sort((a, b) => Number(b.score) - Number(a.score));

  const rankMap = new Map();

  let previousScore = null;
  let currentRank = 0;

  completed.forEach((result, index) => {
    const score = Number(result.score);

    if (previousScore === null || score !== previousScore) {
      currentRank = index + 1;
    }

    rankMap.set(result.id, currentRank);
    previousScore = score;
  });

  return results.map((result) => ({
    ...result,
    rank: rankMap.get(result.id) ?? null,
  }));
};
