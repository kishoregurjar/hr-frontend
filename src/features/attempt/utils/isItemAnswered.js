export const isItemAnswered = (response) => {
  if (!response) {
    return false;
  }

  const hasAnswer =
    response.answer !== undefined &&
    response.answer !== null &&
    response.answer !== "";

  const hasScore =
    response.score !== undefined &&
    response.score !== null;

  return hasAnswer || hasScore;
};
