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

    if (!Array.isArray(list) || list.length === 0) {
      return [];
    }

    // Auto-enrich list items with questions and games count in parallel if backend list omitted relations
    const enrichedList = await Promise.all(
      list.map(async (item) => {
        const itemId = item?.id || item?._id;
        if (!itemId) return item;

        const currentQCount =
          (Array.isArray(item.questions) ? item.questions.length : null) ??
          (Array.isArray(item.AssessmentQuestions) ? item.AssessmentQuestions.length : null) ??
          (Array.isArray(item.questionIds) ? item.questionIds.length : null) ??
          item.questionCount ??
          item.totalQuestions ??
          item._count?.questions ??
          item._count?.AssessmentQuestions ??
          0;

        if (currentQCount > 0) {
          return item;
        }

        try {
          const detailRes = await axiosClient.get(`/assessments/${itemId}`);
          const detail = detailRes?.data?.data || detailRes?.data || detailRes;
          if (detail && typeof detail === "object") {
            const detailQuestions = detail.questions || detail.AssessmentQuestions || detail.questionIds || [];
            const detailGames = detail.games || detail.AssessmentGames || detail.gameIds || [];
            return {
              ...item,
              ...detail,
              questions: detailQuestions,
              questionIds: Array.isArray(detailQuestions) ? detailQuestions.map((q) => q?.questionId || q?.id || q) : [],
              questionCount: Array.isArray(detailQuestions) ? detailQuestions.length : 0,
              games: detailGames,
              gameCount: Array.isArray(detailGames) ? detailGames.length : 0,
              durationMinutes: detail.durationMinutes || item.durationMinutes || item.duration || 60,
            };
          }
        } catch {
          // Ignore individual detail fetch failure
        }

        return item;
      })
    );

    return enrichedList;
  } catch (error) {
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
