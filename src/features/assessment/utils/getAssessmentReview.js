import { buildRuntimeSections } from "./buildRuntimeSections";
import { getSectionCompletion } from "./getSectionCompletion";

export const getAssessmentReview = ({ assessment, attempt }) => {
  const sections = buildRuntimeSections(assessment);

  const sectionReviews = sections.map((section, index) => {
    const completion = getSectionCompletion({
      section,
      attempt,
    });

    return {
      section,
      index,
      ...completion,
    };
  });

  const completedSections = sectionReviews.filter(
    (item) => item.isComplete
  ).length;

  const totalSections = sectionReviews.length;
  const incompleteSections = totalSections - completedSections;

  return {
    sections: sectionReviews,
    totalSections,
    completedSections,
    incompleteSections,
    isComplete: totalSections > 0 && incompleteSections === 0,
  };
};
