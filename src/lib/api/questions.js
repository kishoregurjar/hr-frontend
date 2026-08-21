import axiosClient from "./axiosClient";

/**
 * Helper to extract response data envelope safely (handles res.data, res.items, or res array)
 */
const extractArrayData = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.questions)) return res.data.questions;
  if (Array.isArray(res?.data?.categories)) return res.data.categories;
  if (Array.isArray(res?.data?.tags)) return res.data.tags;
  if (Array.isArray(res?.data?.items)) return res.data.items;
  if (Array.isArray(res?.data?.results)) return res.data.results;
  if (Array.isArray(res?.data?.rows)) return res.data.rows;
  if (Array.isArray(res?.questions)) return res.questions;
  if (Array.isArray(res?.categories)) return res.categories;
  if (Array.isArray(res?.tags)) return res.tags;
  if (Array.isArray(res?.items)) return res.items;
  if (Array.isArray(res?.message)) return res.message;
  if (Array.isArray(res?.message?.questions)) return res.message.questions;
  if (Array.isArray(res?.message?.categories)) return res.message.categories;
  if (Array.isArray(res?.message?.items)) return res.message.items;
  return [];
};

/**
 * Normalizes backend question format to consistent frontend UI question object
 */
export const normalizeQuestion = (item) => {
  if (!item || typeof item !== "object") return null;

  const id = item.id || item._id;
  const questionText = item.title || item.question || "";
  const description = item.description || "";
  const explanation = item.explanation || "";

  // Normalize Category
  const category =
    typeof item.category === "object"
      ? item.category?.name || "General"
      : item.category || item.categoryName || "General";
  const categoryId =
    item.categoryId || (typeof item.category === "object" ? item.category?.id : null);

  // Normalize Difficulty (Easy | Medium | Hard)
  let difficulty = "Easy";
  if (item.difficulty) {
    const rawDiff = String(item.difficulty).toUpperCase();
    if (rawDiff === "EASY") difficulty = "Easy";
    else if (rawDiff === "MEDIUM") difficulty = "Medium";
    else if (rawDiff === "HARD") difficulty = "Hard";
    else difficulty = item.difficulty;
  }

  // Normalize Status (Active | Draft | Archived)
  let status = "Draft";
  if (item.status) {
    const rawStatus = String(item.status).toUpperCase();
    if (rawStatus === "PUBLISHED" || rawStatus === "ACTIVE") status = "Active";
    else if (rawStatus === "DRAFT") status = "Draft";
    else if (rawStatus === "ARCHIVED") status = "Archived";
    else status = item.status;
  }

  // Normalize Type
  const type = item.type === "SINGLE_CHOICE" ? "MCQ" : item.type || "MCQ";

  // Normalize Options and Correct Answer
  let options = [];
  let correctAnswer = "optionA";

  if (Array.isArray(item.options) && item.options.length > 0) {
    options = item.options.map((opt, index) => {
      const optionKey = `option${String.fromCharCode(65 + index)}`; // optionA, optionB, etc.
      const isCorrect = Boolean(opt.isCorrect || opt.id === item.correctAnswer);
      if (isCorrect) {
        correctAnswer = optionKey;
      }
      return {
        id: optionKey,
        text: opt.optionText || opt.text || "",
      };
    });
  } else {
    options = [
      { id: "optionA", text: "Option A" },
      { id: "optionB", text: "Option B" },
      { id: "optionC", text: "Option C" },
      { id: "optionD", text: "Option D" },
    ];
  }

  return {
    id,
    question: questionText,
    title: questionText,
    description,
    explanation,
    category,
    categoryId,
    difficulty,
    type,
    status,
    options,
    correctAnswer: item.correctAnswer || correctAnswer,
    usedIn: item.usedIn ?? 0,
    updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
  };
};

/**
 * Formats frontend form payload into backend JSON structure for POST / PATCH /questions
 */
export const formatQuestionPayload = (payload) => {
  const title = payload.question || payload.title || "";
  const description = payload.description || title || "Question description";
  const explanation = payload.explanation || title || "Question explanation";

  let type = "SINGLE_CHOICE";
  if (payload.type) {
    if (payload.type === "MCQ") type = "SINGLE_CHOICE";
    else type = String(payload.type).toUpperCase();
  }

  let difficulty = "EASY";
  if (payload.difficulty) {
    difficulty = String(payload.difficulty).toUpperCase();
  }

  let status = "DRAFT";
  if (payload.status) {
    const s = String(payload.status).toUpperCase();
    if (s === "ACTIVE" || s === "PUBLISHED") status = "PUBLISHED";
    else if (s === "DRAFT") status = "DRAFT";
    else if (s === "ARCHIVED") status = "ARCHIVED";
  }

  // Format Options array for Backend API
  let options = [];
  if (Array.isArray(payload.options)) {
    options = payload.options.map((opt, index) => {
      const text = opt.text || opt.optionText || "";
      const isCorrect =
        payload.correctAnswer === opt.id ||
        payload.correctAnswer === `option${String.fromCharCode(65 + index)}` ||
        Boolean(opt.isCorrect);
      return {
        text,
        optionText: text,
        isCorrect,
        sequence: index + 1,
      };
    });
  }

  const categoryId = payload.categoryId;

  const validTagIds =
    Array.isArray(payload.tagIds) && payload.tagIds.length > 0
      ? payload.tagIds.filter((id) => !id.startsWith("cm_tag_") && id.length > 5)
      : undefined;

  const marks = payload.marks ? Number(payload.marks) : 5;

  const resultPayload = {
    title,
    description,
    explanation,
    type,
    difficulty,
    status,
    marks,
    negativeMarks: payload.negativeMarks ? Number(payload.negativeMarks) : 0,
    estimatedTime: payload.estimatedTime ? Number(payload.estimatedTime) : 120,
    shuffleOptions: payload.shuffleOptions ?? true,
    ...(categoryId ? { categoryId } : {}),
    ...(validTagIds && validTagIds.length > 0 ? { tagIds: validTagIds } : {}),
    options,
  };

  return resultPayload;
};

/* ==========================================================================
   Question Categories APIs (/question-categories) — LIVE BACKEND
   ========================================================================== */

export const getQuestionCategories = async (params = {}) => {
  try {
    const res = await axiosClient.get("/question-categories", { params });
    const rawList = extractArrayData(res);
    return {
      success: true,
      data: rawList,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

export const getQuestionCategoryById = async (id) => {
  const res = await axiosClient.get(`/question-categories/${id}`);
  return res?.data?.data || res?.data || res;
};

export const createQuestionCategory = async (payload) => {
  const body = {
    name: payload.name || "Programming",
    description: payload.description || `${payload.name || "Programming"} questions category`,
  };
  const res = await axiosClient.post("/question-categories", body);
  const data = res?.data?.data || res?.data || res;
  return {
    success: true,
    data,
  };
};

export const updateQuestionCategory = async (id, payload) => {
  const body = {
    ...(payload.name ? { name: payload.name } : {}),
    ...(payload.description !== undefined ? { description: payload.description } : {}),
  };
  const res = await axiosClient.patch(`/question-categories/${id}`, body);
  const data = res?.data?.data || res?.data || res;
  return {
    success: true,
    data,
  };
};

export const deleteQuestionCategory = async (id) => {
  const res = await axiosClient.delete(`/question-categories/${id}`);
  return res?.data?.data || res?.data || res;
};

export const restoreQuestionCategory = async (id) => {
  const res = await axiosClient.patch(`/question-categories/${id}/restore`);
  return res?.data?.data || res?.data || res;
};

/* ==========================================================================
   Question Tags APIs (/question-tags) — LIVE BACKEND
   ========================================================================== */

export const getQuestionTags = async (params = {}) => {
  try {
    const res = await axiosClient.get("/question-tags", { params });
    const rawList = extractArrayData(res);
    return {
      success: true,
      data: rawList,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

export const getQuestionTagById = async (id) => {
  const res = await axiosClient.get(`/question-tags/${id}`);
  return res?.data?.data || res?.data || res;
};

export const createQuestionTag = async (payload) => {
  const body = {
    name: payload.name || "General",
  };
  const res = await axiosClient.post("/question-tags", body);
  const data = res?.data?.data || res?.data || res;
  return {
    success: true,
    data,
  };
};

export const updateQuestionTag = async (id, payload) => {
  const body = {
    ...(payload.name ? { name: payload.name } : {}),
  };
  const res = await axiosClient.patch(`/question-tags/${id}`, body);
  const data = res?.data?.data || res?.data || res;
  return {
    success: true,
    data,
  };
};

export const deleteQuestionTag = async (id) => {
  const res = await axiosClient.delete(`/question-tags/${id}`);
  return res?.data?.data || res?.data || res;
};

export const restoreQuestionTag = async (id) => {
  const res = await axiosClient.patch(`/question-tags/${id}/restore`);
  return res?.data?.data || res?.data || res;
};

/* ==========================================================================
   Question Bank APIs (/questions) — LIVE BACKEND INTEGRATION
   ========================================================================== */

/**
 * Fetch Questions List — LIVE API: GET /api/v1/questions
 */
export const getQuestions = async (params = {}) => {
  try {
    const res = await axiosClient.get("/questions", { params });
    const rawList = extractArrayData(res);
    const normalized = rawList.map(normalizeQuestion).filter(Boolean);

    return {
      success: true,
      data: normalized,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to fetch questions",
      data: [],
    };
  }
};

/**
 * Fetch Single Question by ID — LIVE API: GET /api/v1/questions/:id
 */
export const getQuestionById = async (id) => {
  const res = await axiosClient.get(`/questions/${id}`);
  const rawData = res?.data?.data || res?.data || res;
  const normalized = normalizeQuestion(rawData);

  if (!normalized) {
    throw new Error("Question not found");
  }

  return {
    success: true,
    data: normalized,
  };
};

/**
 * Create New Question — LIVE API: POST /api/v1/questions
 */
export const createQuestion = async (payload) => {
  let categoryId = payload.categoryId;

  // Dynamically resolve categoryId if missing from form submission
  if (!categoryId || categoryId === payload.category || categoryId.length < 5) {
    try {
      const catRes = await getQuestionCategories();
      const existingCats = catRes?.data || [];
      const categoryName = String(payload.category || "").toLowerCase().trim();

      const matchedCat =
        existingCats.find(
          (c) =>
            String(c.name || "").toLowerCase() === categoryName ||
            String(c.id || "") === categoryName
        ) ||
        existingCats.find(
          (c) =>
            String(c.name || "").toLowerCase().includes("prog") ||
            String(c.name || "").toLowerCase().includes("back")
        ) ||
        existingCats[0];

      if (matchedCat?.id) {
        categoryId = matchedCat.id;
      }
    } catch {
      // Fallback
    }
  }

  const formattedBody = formatQuestionPayload({
    ...payload,
    ...(categoryId ? { categoryId } : {}),
  });

  const res = await axiosClient.post("/questions", formattedBody);
  const rawData = res?.data?.data || res?.data || res;
  const normalized = normalizeQuestion(rawData) || {
    id: rawData?.id || `q-${Date.now()}`,
    ...payload,
  };

  return {
    success: true,
    data: normalized,
  };
};

/**
 * Update Question — LIVE API: PATCH /api/v1/questions/:id
 */
export const updateQuestion = async (id, payload) => {
  const formattedBody = formatQuestionPayload(payload);
  const res = await axiosClient.patch(`/questions/${id}`, formattedBody);
  const rawData = res?.data || res;
  const normalized = normalizeQuestion(rawData) || { id, ...payload };

  return {
    success: true,
    data: normalized,
  };
};

/**
 * Delete Question — LIVE API: DELETE /api/v1/questions/:id
 */
export const deleteQuestion = async (id) => {
  await axiosClient.delete(`/questions/${id}`);
  return {
    success: true,
    data: id,
  };
};

/**
 * Publish Question — LIVE API: POST /api/v1/questions/:id/publish
 */
export const publishQuestion = async (id) => {
  const res = await axiosClient.post(`/questions/${id}/publish`);
  return {
    success: true,
    data: res?.data || res,
  };
};

/**
 * Archive Question — LIVE API: POST /api/v1/questions/:id/archive
 */
export const archiveQuestion = async (id) => {
  const res = await axiosClient.post(`/questions/${id}/archive`);
  return {
    success: true,
    data: res?.data || res,
  };
};
