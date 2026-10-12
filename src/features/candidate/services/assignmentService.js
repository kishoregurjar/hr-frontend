import {
  assignAssessment,
  getAssignmentByToken,
  getAssignments,
  sendBulkInvitations,
  sendInvitation,
} from "@/lib/api/assignments";

export const assignmentService = {
  getAll: async () => {
    return getAssignments();
  },

  getByToken: async (token) => {
    return getAssignmentByToken(token);
  },

  assign: async (payload) => {
    return assignAssessment(payload);
  },

  sendInvitation: async (assignmentId) => {
    return sendInvitation(assignmentId);
  },

  sendBulkInvitations: async (assignmentIds) => {
    return sendBulkInvitations(assignmentIds);
  },
};
