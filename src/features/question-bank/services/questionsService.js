import {
  createQuestion,
  bulkCreateQuestions,
  deleteQuestion,
  getQuestionById,
  getQuestions,
  updateQuestion,
} from "@/lib/api/questions";

export const questionsService = {
  getAll: async () => {
    return getQuestions();
  },

  getById: async (id) => {
    return getQuestionById(id);
  },

  create: async (data) => {
    return createQuestion(data);
  },

  bulkCreate: async (data) => {
    return bulkCreateQuestions(data);
  },

  update: async (id, data) => {
    return updateQuestion(id, data);
  },

  remove: async (id) => {
    return deleteQuestion(id);
  },
};
