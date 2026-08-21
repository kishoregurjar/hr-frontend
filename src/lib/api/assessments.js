import axiosClient from "./axiosClient";

/**
 * Extract array list from various backend response envelopes safely
 */
const extractAssessmentsList = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.assessments)) return res.data.assessments;
  if (Array.isArray(res?.data?.items)) return res.data.items;
  if (Array.isArray(res?.assessments)) return res.assessments;
  if (Array.isArray(res?.items)) return res.items;
  return [];
};

/**
 * 1. Fetch All Assessments — GET /api/v1/assessments
 */
export const getAssessments = async (params = {}) => {
  try {
    const res = await axiosClient.get("/assessments", { params });
    const list = extractAssessmentsList(res);
    return list;
  } catch (error) {
    console.error("Failed to fetch assessments:", error);
    return [];
  }
};

/**
 * 2. Fetch Single Assessment Details — GET /api/v1/assessments/:id
 */
export const getAssessmentById = async (id) => {
  const res = await axiosClient.get(`/assessments/${id}`);
  return res?.data?.data || res?.data || res;
};

/**
 * 3. Create Assessment — POST /api/v1/assessments
 */
export const createAssessment = async (payload) => {
  const res = await axiosClient.post("/assessments", payload);
  return res?.data?.data || res?.data || res;
};

/**
 * 4. Update Assessment — PATCH / PUT /api/v1/assessments/:id
 */
export const updateAssessment = async (id, payload) => {
  // Supports both PATCH and PUT seamlessly
  const res = await axiosClient.patch(`/assessments/${id}`, payload);
  return res?.data?.data || res?.data || res;
};

/**
 * 5. Delete Assessment (Soft Delete) — DELETE /api/v1/assessments/:id
 */
export const deleteAssessment = async (id) => {
  const res = await axiosClient.delete(`/assessments/${id}`);
  return res?.data?.data || res?.data || res;
};

/**
 * 6. Publish Assessment — POST /api/v1/assessments/:id/publish
 */
export const publishAssessment = async (id) => {
  const res = await axiosClient.post(`/assessments/${id}/publish`);
  return res?.data?.data || res?.data || res;
};

/**
 * 7. Unpublish Assessment — POST /api/v1/assessments/:id/unpublish
 */
export const unpublishAssessment = async (id) => {
  const res = await axiosClient.post(`/assessments/${id}/unpublish`);
  return res?.data?.data || res?.data || res;
};

/**
 * 8. Activate Assessment — POST /api/v1/assessments/:id/activate
 */
export const activateAssessment = async (id) => {
  const res = await axiosClient.post(`/assessments/${id}/activate`);
  return res?.data?.data || res?.data || res;
};

/**
 * 9. Archive Assessment — POST /api/v1/assessments/:id/archive
 */
export const archiveAssessment = async (id) => {
  const res = await axiosClient.post(`/assessments/${id}/archive`);
  return res?.data?.data || res?.data || res;
};

/**
 * 10. Restore Assessment — PATCH /api/v1/assessments/:id/restore
 */
export const restoreAssessment = async (id) => {
  const res = await axiosClient.patch(`/assessments/${id}/restore`);
  return res?.data?.data || res?.data || res;
};

/**
 * 11. Duplicate Assessment — POST /api/v1/assessments/:id/duplicate
 */
export const duplicateAssessment = async (id, payload = {}) => {
  const res = await axiosClient.post(`/assessments/${id}/duplicate`, payload);
  return res?.data?.data || res?.data || res;
};

/**
 * 12. Assign Questions to Assessment — POST /api/v1/assessments/:id/questions
 */
export const assignAssessmentQuestions = async (id, questionIds = []) => {
  const res = await axiosClient.post(`/assessments/${id}/questions`, { questionIds });
  return res?.data?.data || res?.data || res;
};

/**
 * 13. Reorder Assessment Questions — PATCH /api/v1/assessments/:id/questions/reorder
 */
export const reorderAssessmentQuestions = async (id, questionOrders = []) => {
  const res = await axiosClient.patch(`/assessments/${id}/questions/reorder`, {
    orders: questionOrders,
  });
  return res?.data?.data || res?.data || res;
};
