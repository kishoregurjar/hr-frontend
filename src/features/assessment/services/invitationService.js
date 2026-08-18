import { getAssignmentByToken } from "@/lib/api/assignments";
import { getCandidateById } from "@/lib/api/candidates";
import { getAssessmentById } from "@/lib/api/assessments";

export const invitationService = {
  getByToken: async (token) => {
    const assignment = await getAssignmentByToken(token);

    const [candidate, assessment] = await Promise.all([
      getCandidateById(assignment.candidateId),
      getAssessmentById(assignment.assessmentId),
    ]);

    return {
      assignment,
      candidate,
      assessment,
    };
  },
};
