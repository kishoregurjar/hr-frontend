export const getNextRound = ({ rounds = [], currentRoundId }) => {
  const sortedRounds = [...rounds].sort((a, b) => a.order - b.order);

  const currentIndex = sortedRounds.findIndex(
    (round) => String(round.id) === String(currentRoundId)
  );

  if (currentIndex === -1 || currentIndex === sortedRounds.length - 1) {
    return null;
  }

  return sortedRounds[currentIndex + 1];
};
