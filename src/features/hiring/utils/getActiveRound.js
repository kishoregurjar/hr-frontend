export const getActiveRound = (rounds = []) => {
  return rounds.find((round) => round.status === "Active") ?? null;
};
