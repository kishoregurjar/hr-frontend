export const getPipelineStats = ({ process, candidates = [] }) => {
  const rounds = process?.rounds ?? [];

  return rounds.map((round) => {
    const count = candidates.filter((candidate) =>
      candidate.rounds.some(
        (candidateRound) =>
          candidateRound.roundId === round.id &&
          candidateRound.decision !== "Rejected"
      )
    ).length;

    return {
      roundId: round.id,
      title: round.title,
      count,
    };
  });
};
