import axiosClient from "./axiosClient";

/**
 * Extract array list from various backend response envelopes safely
 */
/**
 * Extract array list from various backend response envelopes safely
 */
const extractAssessmentsList = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data?.items)) return res.data.items;
  if (Array.isArray(res?.data?.assessments)) return res.data.assessments;
  if (Array.isArray(res?.data?.data?.items)) return res.data.data.items;
  if (Array.isArray(res?.data?.data?.assessments)) return res.data.data.assessments;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.message?.items)) return res.message.items;
  if (Array.isArray(res?.message?.assessments)) return res.message.assessments;
  if (Array.isArray(res?.message)) return res.message;
  if (Array.isArray(res?.items)) return res.items;
  if (Array.isArray(res?.assessments)) return res.assessments;
  if (res?.data && typeof res.data === "object") {
    if (Array.isArray(res.data.items)) return res.data.items;
    if (Array.isArray(res.data.assessments)) return res.data.assessments;
  }
  return [];
};

/**
 * 1. Fetch All Assessments — GET /api/v1/assessments (100% Live Backend Database)
 */
export const getAssessments = async (rawParams = {}) => {
  const cleanParams = {};
  if (rawParams && typeof rawParams === "object" && !Array.isArray(rawParams)) {
    ["status", "type", "difficulty", "search", "page", "limit", "sortBy", "sortOrder"].forEach((key) => {
      if (rawParams[key] !== undefined && rawParams[key] !== "all" && rawParams[key] !== "") {
        cleanParams[key] = rawParams[key];
      }
    });
  }

    if (!cleanParams.limit) {
      cleanParams.limit = 100;
    }

    const res = await axiosClient.get("/assessments", {
      params: cleanParams,
    });
    const list = extractAssessmentsList(res);
    return Array.isArray(list) ? list : [];
  } catch (error) {
    console.warn("Notice fetching backend assessments:", error.message);
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
 * 3. Create Assessment — POST /api/v1/assessments (Auto-Published)
 */
export const createAssessment = async (payload) => {
  const requestStatus = String(payload?.status || "PUBLISHED").toUpperCase();
  const finalPayload = {
    ...payload,
    status: requestStatus === "DRAFT" ? "DRAFT" : "PUBLISHED",
  };

  const res = await axiosClient.post("/assessments", finalPayload);
  const created = res?.data?.data || res?.data || res;
  const createdId = created?.id || created?._id;
  const createdStatus = String(created?.status || "").toUpperCase();

  if (createdId) {
    const hasQuestions = Array.isArray(created?.questions) && created.questions.length > 0;
    if (!hasQuestions && Array.isArray(payload?.questionIds) && payload.questionIds.length > 0) {
      try {
        await assignAssessmentQuestions(createdId, payload.questionIds);
      } catch (e) {
        console.warn("Auto-assign questions on create:", e.message);
      }
    }

    if (requestStatus === "PUBLISHED" && createdStatus !== "PUBLISHED") {
      try {
        await publishAssessment(createdId);
      } catch (e) {
        console.warn("Auto-publish on create:", e?.message);
      }
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
    const existingQIds = new Set((updated?.questions || []).map((q) => q.questionId || q.id || q));
    const newQIds = targetQuestionIds.filter((qId) => !existingQIds.has(typeof qId === "object" ? qId?.id || qId?.questionId : qId));
    if (newQIds.length > 0) {
      try {
        await assignAssessmentQuestions(id, newQIds);
      } catch (e) {
        console.warn("Auto-assign questions on update:", e?.message);
      }
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
    questionId: String(qId),
    sequence: index + 1,
    marks: typeof qId === "object" && qId?.marks ? Number(qId.marks) : 5,
    negativeMarks: typeof qId === "object" && qId?.negativeMarks ? Number(qId.negativeMarks) : 0,
  }));

  try {
    const res = await axiosClient.post(`/assessments/${id}/questions`, {
      questions: objectQuestions,
    });
    return res?.data?.data || res?.data || res;
  } catch (err) {
    console.error("Assign questions error:", err?.message);
    throw err;
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
