import {
  startAssessmentWorkflow,
  submitAssessmentWorkflow,
} from "@/lib/api/assessmentWorkflow";
import {
  getAttemptByAssignmentId,
  recordIntegrityEvent,
  saveAttemptProgress,
  saveQuizResponse,
} from "@/lib/api/attempts";

export const attemptService = {
  start: async (token) => startAssessmentWorkflow(token),

  getByAssignment: async (assignmentId) =>
    getAttemptByAssignmentId(assignmentId),

  save: async (payload) => saveAttemptProgress(payload),

  saveResponse: async (payload) => saveQuizResponse(payload),

  submit: async (payload) => submitAssessmentWorkflow(payload),

  recordIntegrityEvent: async (payload) => recordIntegrityEvent(payload),
};
