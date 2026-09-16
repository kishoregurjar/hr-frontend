export const getGameCompletion = ({ section, attempt }) => {
  const games =
    Array.isArray(section?.games) && section.games.length > 0
      ? section.games
      : [section];

  const completedGames = games.filter((g) => {
    const res =
      attempt?.gameResults?.[g.id] ||
      attempt?.gameResults?.[g.slug] ||
      attempt?.gameResults?.[section.id];
    return Boolean(res);
  });

  const isComplete = games.length > 0 && completedGames.length === games.length;
  const lastResult =
    attempt?.gameResults?.[games[games.length - 1]?.id] ||
    attempt?.gameResults?.[games[games.length - 1]?.slug] ||
    attempt?.gameResults?.[section.id] ||
    null;

  return {
    result: lastResult,
    completedCount: completedGames.length,
    totalCount: games.length,
    isComplete,
  };
};
