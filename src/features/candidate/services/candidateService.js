import {
  createCandidate,
  getCandidateById,
  getCandidates,
  importCandidates,
  updateCandidate,
} from "@/lib/api/candidates";

export const candidateService = {
  getAll: async () => {
    return getCandidates();
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

  importMany: async (candidates) => {
    return importCandidates(candidates);
  },
};
