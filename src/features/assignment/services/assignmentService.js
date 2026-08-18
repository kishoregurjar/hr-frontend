import {
  getAssignmentByToken,
  getRoundAssignments,
  resendAssignmentInvitation,
  startAssignment,
} from "@/lib/api/assignments";

export const assignmentService = {
  getByToken: async (token) => getAssignmentByToken(token),

  getRoundAssignments: async ({ hiringProcessId, roundId }) =>
    getRoundAssignments({ hiringProcessId, roundId }),

  resend: async (assignmentId) => resendAssignmentInvitation(assignmentId),

  start: async (token) => startAssignment(token),
};
