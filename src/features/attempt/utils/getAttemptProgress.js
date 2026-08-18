export const getAttemptProgress = ({ items = [], responses = [] }) => {
  const answeredIds = new Set(
    responses
      .filter(
        (response) =>
          response.answer !== undefined &&
          response.answer !== null &&
          response.answer !== ""
      )
      .map((response) => response.itemId)
  );

  const total = items.length;
  const answered = items.filter((item) => answeredIds.has(item.id)).length;

  return {
    total,
    answered,
    remaining: Math.max(0, total - answered),
    percentage: total > 0 ? Math.round((answered / total) * 100) : 0,
  };
};
