import { buildRuntimeSections } from "./buildRuntimeSections";
import { getSectionCompletion } from "./getSectionCompletion";

export const getAssessmentReview = ({ assessment, attempt }) => {
  const sections = buildRuntimeSections(assessment);

  let totalUnansweredQuestions = 0;

  const sectionReviews = sections.map((section, index) => {
    const completion = getSectionCompletion({
      section,
      attempt,
    });

    if (section.type === "quiz" && completion.details?.unansweredQuestions) {
      totalUnansweredQuestions += completion.details.unansweredQuestions;
    }

    return {
      section,
      index,
      ...completion,
    };
  });

  const completedSections = sectionReviews.filter(
    (item) => item.status === "completed" || item.isComplete
  ).length;

  const totalSections = sectionReviews.length;
  const incompleteSections = Math.max(0, totalSections - completedSections);

  return {
    sections: sectionReviews,
    totalSections,
    completedSections,
    incompleteSections,
    totalUnansweredQuestions,
    // Assessments are always submittable from Review
    isComplete: true,
  };
};
