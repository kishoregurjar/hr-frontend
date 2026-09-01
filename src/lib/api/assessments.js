import axiosClient from "./axiosClient";

/**
 * Extract array list from various backend response envelopes safely
 */
const extractAssessmentsList = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data?.items)) return res.data.items;
  if (Array.isArray(res?.message?.items)) return res.message.items;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.message)) return res.message;
  if (Array.isArray(res?.data?.assessments)) return res.data.assessments;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.items)) return res.items;
  if (Array.isArray(res?.assessments)) return res.assessments;
  if (res?.data && typeof res.data === "object") {
    if (Array.isArray(res.data.items)) return res.data.items;
  }
  if (res?.message && typeof res.message === "object") {
    if (Array.isArray(res.message.items)) return res.message.items;
  }
  return [];
};

/**
 * 1. Fetch All Assessments — GET /api/v1/assessments
 */
export const getAssessments = async (rawParams = {}) => {
  const cleanParams = { _t: Date.now() };
  if (rawParams && typeof rawParams === "object" && !Array.isArray(rawParams)) {
    ["status", "type", "difficulty", "search", "page", "limit", "sortBy", "sortOrder"].forEach((key) => {
      if (rawParams[key] !== undefined && rawParams[key] !== "all" && rawParams[key] !== "") {
        cleanParams[key] = rawParams[key];
      }
    });
  }

  try {
    const res = await axiosClient.get("/assessments", {
      params: cleanParams,
    });
    const list = extractAssessmentsList(res);

    if (!Array.isArray(list) || list.length === 0) {
      return [];
    }

    return list;
  } catch (error) {
    console.error("Error fetching assessments list:", error);
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
  const created = res?.data?.data || res?.data || res;
  const createdId = created?.id || created?._id;

  if (createdId && Array.isArray(payload?.questionIds) && payload.questionIds.length > 0) {
    try {
      await assignAssessmentQuestions(createdId, payload.questionIds);
    } catch (e) {
      console.warn("Auto-assign questions on create:", e.message);
    }
  }

  if (createdId && String(payload?.status || "").toUpperCase() === "PUBLISHED") {
    try {
      await publishAssessment(createdId);
    } catch (e) {
      console.warn("Auto-publish on create:", e.message);
    }
  }

  if (createdId) {
    try {
      const fresh = await getAssessmentById(createdId);
      return fresh;
    } catch {
      return created;
    }
  }

  return created;
};

/**
 * 4. Update Assessment — PATCH / PUT /api/v1/assessments/:id
 */
export const updateAssessment = async (id, payload) => {
  const targetQuestionIds =
    payload?.questionIds || payload?.questions || payload?.selectedQuestionIds || [];

  const res = await axiosClient.patch(`/assessments/${id}`, payload);
  const updated = res?.data?.data || res?.data || res;

  if (id && Array.isArray(targetQuestionIds) && targetQuestionIds.length > 0) {
    try {
      await assignAssessmentQuestions(id, targetQuestionIds);
    } catch (e) {
      console.warn("Auto-assign questions on update:", e?.message);
    }
  }

  if (id && String(payload?.status || "").toUpperCase() === "PUBLISHED") {
    try {
      await publishAssessment(id);
    } catch (e) {
      console.warn("Auto-publish on update:", e?.message);
    }
  }

  if (id) {
    try {
      const fresh = await getAssessmentById(id);
      return fresh;
    } catch {
      return updated;
    }
  }

  return updated;
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
  const flatIds = questionIds
    .map((q) => (typeof q === "object" ? q?.id || q?._id || q?.questionId : q))
    .filter(Boolean);

  if (flatIds.length === 0) return { success: true };

  const objectQuestions = flatIds.map((qId, index) => ({
    questionId: qId,
    sequence: index + 1,
    marks: typeof qId === "object" && qId?.marks ? Number(qId.marks) : 1,
    negativeMarks: typeof qId === "object" && qId?.negativeMarks ? Number(qId.negativeMarks) : 0,
  }));

  try {
    // Attempt 1: Exact backend schema { questions: [ { questionId, sequence, marks, negativeMarks } ] }
    const res = await axiosClient.post(`/assessments/${id}/questions`, {
      questions: objectQuestions,
    });
    return res?.data?.data || res?.data || res;
  } catch (err1) {
    try {
      // Attempt 2: { questionIds: [...] }
      const res = await axiosClient.post(`/assessments/${id}/questions`, {
        questionIds: flatIds,
      });
      return res?.data?.data || res?.data || res;
    } catch (err2) {
      try {
        // Attempt 3: { questions: [...] } (array of string IDs)
        const res = await axiosClient.post(`/assessments/${id}/questions`, {
          questions: flatIds,
        });
        return res?.data?.data || res?.data || res;
      } catch (err3) {
        console.error("Assign questions API call fallback:", err3?.message);
        throw err3;
      }
    }
  }
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
