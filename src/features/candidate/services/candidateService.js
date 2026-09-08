import {
  createCandidate,
  extractCandidateFromEmail,
  getCandidateById,
  getCandidates,
  importCandidates,
  inviteCandidateToAssessment,
  syncEmailApplications,
  updateCandidate,
  updateCandidateStatus,
} from "@/lib/api/candidates";

export const candidateService = {
  getAll: async (params) => {
    return getCandidates(params);
  },

  getById: async (id) => {
    return getCandidateById(id);
  },

  create: async (payload) => {
    return createCandidate(payload);
  },

  update: async ({ id, data }) => {
    return updateCandidate(id, data);
  },

  updateStatus: async ({ id, status }) => {
    return updateCandidateStatus(id, status);
  },

  syncEmails: async (config) => {
    return syncEmailApplications(config);
  },

  extractFromEmail: async (rawEmailText) => {
    return extractCandidateFromEmail(rawEmailText);
  },

  invite: async ({ candidateId, assessmentId }) => {
    return inviteCandidateToAssessment(candidateId, assessmentId);
  },

  importMany: async (candidates) => {
    return importCandidates(candidates);
  },

  uploadResume: async ({ file, jobId }) => {
    return uploadResume({ file, jobId });
  },

  getResumeStatus: async (resumeId) => {
    return getResumeStatus(resumeId);
  },
};
