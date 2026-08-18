export const getGameCompletion = ({ section, attempt }) => {
  const result = attempt?.gameResults?.[section.id];

  return {
    result: result ?? null,
    isComplete: Boolean(result),
  };
};
