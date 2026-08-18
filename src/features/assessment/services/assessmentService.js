import {
  createAssessment,
  getAssessmentById,
  getAssessments,
  updateAssessment,
} from "@/lib/api/assessments";

export const assessmentService = {
  getAll: async () => {
    return getAssessments();
  },

  getById: async (id) => {
    return getAssessmentById(id);
  },

  create: async (payload) => {
    return createAssessment(payload);
  },

  update: async (id, payload) => {
    return updateAssessment(id, payload);
  },
};
