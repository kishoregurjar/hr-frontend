import { ASSESSMENT_STATUS } from "../constants";

export const getAssessmentStats = (assessments = []) => {
  return assessments.reduce(
    (stats, assessment) => {
      stats.total += 1;

      if (assessment.status === ASSESSMENT_STATUS.PUBLISHED) {
        stats.published += 1;
      }

      if (assessment.status === ASSESSMENT_STATUS.DRAFT) {
        stats.draft += 1;
      }

      if (assessment.status === ASSESSMENT_STATUS.ARCHIVED) {
        stats.archived += 1;
      }

      return stats;
    },
    {
      total: 0,
      published: 0,
      draft: 0,
      archived: 0,
    }
  );
};
