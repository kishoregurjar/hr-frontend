export const getEligibleCandidates = ({ candidates = [], roundId }) => {
  if (!roundId) return [];

  return candidates.filter((candidate) => {
    const round = candidate.rounds.find(
      (item) => String(item.roundId) === String(roundId)
    );

    return (
      round?.status === "Completed" &&
      round?.decision === "Shortlisted" &&
      String(candidate.currentRoundId) === String(roundId)
    );
  });
};
