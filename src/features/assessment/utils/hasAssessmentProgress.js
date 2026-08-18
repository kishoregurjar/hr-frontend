import { DEFAULT_ASSESSMENT } from "../constants";

export const hasAssessmentProgress = (assessment) => {
  if (!assessment) return false;

  return (
    (assessment.title?.trim() ?? "") !== "" ||
    (assessment.description?.trim() ?? "") !== "" ||
    (assessment.selectedGameIds?.length ?? 0) > 0 ||
    (assessment.selectedQuestionIds?.length ?? 0) > 0 ||
    assessment.duration !== DEFAULT_ASSESSMENT.duration ||
    assessment.passingScore !== DEFAULT_ASSESSMENT.passingScore ||
    assessment.attemptsAllowed !== DEFAULT_ASSESSMENT.attemptsAllowed ||
    assessment.shuffleQuestions !== DEFAULT_ASSESSMENT.shuffleQuestions ||
    assessment.showResultToCandidate !== DEFAULT_ASSESSMENT.showResultToCandidate
  );
};
