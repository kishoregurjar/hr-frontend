export const getRecentAssessments = (assessments = [], limit = 5) => {
  return [...assessments]
    .sort((a, b) => {
      const dateA = a.updatedAt ?? a.createdAt;
      const dateB = b.updatedAt ?? b.createdAt;

      return (
        new Date(dateB).getTime() - new Date(dateA).getTime()
      );
    })
    .slice(0, limit);
};
