import {
  getAssessmentResults,
  getAssessmentResultSummary,
  getResultById,
  updateCandidateDecision,
  updateCandidateDecisions,
} from "@/lib/api/results";

export const resultService = {
  getAssessmentResults: async (assessmentId) => {
    return getAssessmentResults(assessmentId);
  },

  getAssessmentResultSummary: async (assessmentId) => {
    return getAssessmentResultSummary(assessmentId);
  },

  getResultById: async ({ assessmentId, resultId }) => {
    return getResultById({ assessmentId, resultId });
  },

  updateDecision: async ({ resultId, decision }) => {
    return updateCandidateDecision({ resultId, decision });
  },

  updateDecisions: async ({ resultIds, decision }) => {
    return updateCandidateDecisions({ resultIds, decision });
  },
};
