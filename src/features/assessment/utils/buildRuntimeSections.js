/**
 * Normalizes an assessment object into a flat list of runtime sections.
 *
 * Priority:
 *  1. assessment.sections[]  — structured model
 *  2. Real database questions & selected games:
 *     - assessment.questions / assessment.AssessmentQuestions / assessment.quizzes
 *     - assessment.games / assessment.gameIds / assessment.selectedGameIds / assessment.AssessmentGames
 *  3. Dynamic fallback if no sections defined
 */

import { games as gamesCatalog } from "@/features/games/data";

// Automatically clear stale attempt cache from localStorage if found with placeholder options
if (typeof window !== "undefined") {
  try {
    const rawCache = localStorage.getItem("hirequest_attempts_cache");
    if (rawCache && (rawCache.includes('"label":"Option A"') || rawCache.includes('"text":"Option A"'))) {
      localStorage.removeItem("hirequest_attempts_cache");
    }
  } catch {}
}

const GAME_CATALOG_MAP = gamesCatalog.reduce((acc, g) => {
  if (g.id) acc[g.id] = g;
  if (g.slug) {
    acc[g.slug] = g;
    acc[String(g.slug).toLowerCase()] = g;
    acc[String(g.slug).replace(/-/g, "_")] = g;
    acc[`game_${String(g.slug).replace(/-/g, "_")}`] = g;
  }
  if (g.code) {
    acc[g.code] = g;
    acc[String(g.code).toLowerCase()] = g;
  }
  return acc;
}, {});

const extractTextFromOption = (opt) => {
  if (!opt) return "";
  if (typeof opt === "string") return opt.trim();
  const directText =
    opt.optionText ||
    opt.text ||
    opt.option_text ||
    opt.content ||
    opt.value ||
    opt.name;

  if (directText && typeof directText === "string" && directText.trim().length > 0) {
    return directText.trim();
  }

  if (opt.label && !/^Option\s+[A-Z]$/i.test(String(opt.label).trim())) {
    return String(opt.label).trim();
  }

  return String(opt.label || opt.title || "").trim();
};

/**
 * Normalizes question options from any backend/Prisma format into standard { id, label, text } shape
 */
const normalizeRuntimeOptions = (rawOptions, rawParent = {}) => {
  const qObj = rawParent?.question && typeof rawParent.question === "object" ? rawParent.question : rawParent;

  // 1. Check if qObj or rawParent has flat optionA, optionB, optionC, optionD properties
  const flatKeys = ["A", "B", "C", "D", "E", "F"];
  const flatFound = [];
  for (const k of flatKeys) {
    const val =
      qObj[`option${k}`] ||
      qObj[`opt${k}`] ||
      qObj[`option_${k.toLowerCase()}`] ||
      qObj[`option_${k}`] ||
      rawParent[`option${k}`] ||
      rawParent[`opt${k}`] ||
      rawParent[`option_${k.toLowerCase()}`] ||
      rawParent[`option_${k}`];
    if (val && typeof val === "string" && val.trim().length > 0) {
      flatFound.push({
        id: `opt_${k}`,
        label: val.trim(),
        text: val.trim(),
        isCorrect: qObj.correctAnswer === `option${k}` || rawParent.correctAnswer === `option${k}`,
      });
    }
  }

  // 2. Extract list from rawOptions or relations on qObj / rawParent
  let list = rawOptions;
  if (!list || (Array.isArray(list) && list.length === 0)) {
    list =
      qObj?.options ||
      qObj?.Option ||
      qObj?.optionsList ||
      qObj?.QuestionOption ||
      qObj?.questionOptions ||
      qObj?.question_options ||
      qObj?.choices ||
      qObj?.answers ||
      rawParent?.Option ||
      rawParent?.QuestionOption ||
      rawParent?.questionOptions ||
      rawParent?.question_options ||
      rawParent?.options ||
      rawParent?.choices;
  }

  // If stringified JSON, parse it
  if (typeof list === "string") {
    try {
      list = JSON.parse(list);
    } catch {
      list = [];
    }
  }

  // 3. If list is an array, normalize every item
  if (Array.isArray(list) && list.length > 0) {
    const parsedList = list.map((opt, idx) => {
      const letter = String.fromCharCode(65 + idx);
      const optionKey = `opt_${letter}`;
      if (typeof opt === "string") {
        return { id: optionKey, label: opt, text: opt };
      }
      const optionId = String(
        opt.id ||
        opt.rawId ||
        opt.optionKey ||
        opt.key ||
        optionKey
      );
      const extracted = extractTextFromOption(opt);
      const optionText = extracted.length > 0 ? extracted : `Option ${letter}`;

      return {
        id: optionId,
        label: optionText,
        text: optionText,
        isCorrect: Boolean(opt.isCorrect || opt.is_correct),
      };
    });

    const hasMeaningfulText = parsedList.some(
      (opt, idx) => opt.text && opt.text !== `Option ${String.fromCharCode(65 + idx)}`
    );

    if (hasMeaningfulText) {
      return parsedList;
    }
  }

  // 4. If flat options were found, use them
  if (flatFound.length > 0) {
    return flatFound;
  }

  // 5. Fallback 4 standard options if none found
  return [
    { id: "opt_A", label: "Option A", text: "Option A" },
    { id: "opt_B", label: "Option B", text: "Option B" },
    { id: "opt_C", label: "Option C", text: "Option C" },
    { id: "opt_D", label: "Option D", text: "Option D" },
  ];
};

/**
 * Normalizes a question object into standard runtime format
 */
const normalizeRuntimeQuestion = (rawQ, index) => {
  if (!rawQ) return null;
  const qObj =
    (rawQ.question && typeof rawQ.question === "object" ? rawQ.question : null) ||
    (rawQ.Question && typeof rawQ.Question === "object" ? rawQ.Question : null) ||
    rawQ;

  const id = String(
    qObj.id ||
    qObj._id ||
    qObj.questionId ||
    rawQ.questionId ||
    rawQ.id ||
    `q_${index + 1}`
  );

  const title =
    qObj.title ||
    qObj.question ||
    qObj.content ||
    qObj.text ||
    rawQ.title ||
    rawQ.question ||
    `Question ${index + 1}`;
  
  let options = normalizeRuntimeOptions(
    qObj.options || qObj.Option || qObj.QuestionOption || qObj.questionOptions,
    qObj
  );

  if (
    (!options || options.length === 0 || (options.length === 4 && options[0].label === "Option A")) &&
    rawQ !== qObj
  ) {
    const parentOpts = normalizeRuntimeOptions(
      rawQ.options || rawQ.Option || rawQ.QuestionOption || rawQ.questionOptions,
      rawQ
    );
    if (parentOpts && parentOpts.length > 0 && parentOpts[0].label !== "Option A") {
      options = parentOpts;
    }
  }

  const rawDesc = qObj.description || rawQ.description || "";
  const cleanDescription =
    rawDesc.trim().toLowerCase() === title.trim().toLowerCase() ? "" : rawDesc.trim();

  return {
    id,
    question: title,
    title,
    description: cleanDescription,
    options,
    type: qObj.type || rawQ.type || "MCQ",
  };
};

export const buildRuntimeSections = (assessment) => {
  if (!assessment) return [];

  // 1. Extract selected games
  const rawGames = Array.isArray(assessment.selectedGameIds) && assessment.selectedGameIds.length > 0
    ? assessment.selectedGameIds
    : Array.isArray(assessment.AssessmentGames) && assessment.AssessmentGames.length > 0
    ? assessment.AssessmentGames
    : Array.isArray(assessment.assessmentGames) && assessment.assessmentGames.length > 0
    ? assessment.assessmentGames
    : Array.isArray(assessment.gameIds) && assessment.gameIds.length > 0
    ? assessment.gameIds
    : Array.isArray(assessment.games) && assessment.games.length > 0
    ? assessment.games
    : [];

  const gameSections = rawGames.map((gameItem, index) => {
    let resolvedSlug = typeof gameItem === "string"
      ? gameItem
      : (gameItem?.game?.code || gameItem?.game?.slug || gameItem?.slug || gameItem?.code || gameItem?.gameId || gameItem?.id || `game-${index + 1}`);

    let catalogInfo = GAME_CATALOG_MAP[resolvedSlug] || GAME_CATALOG_MAP[String(resolvedSlug).toLowerCase()] || {};

    // If resolvedSlug is a CUID (e.g. starts with "cmu") or not found in catalog, resolve via game title/name or fallback to core games
    if (!catalogInfo.id) {
      const gObj = typeof gameItem === "object" ? (gameItem.game || gameItem) : {};
      const gameTitleStr = String(gObj.title || gObj.name || gameItem?.title || gameItem?.name || "").toLowerCase();

      if (gameTitleStr.includes("mahjong")) resolvedSlug = "mahjong";
      else if (gameTitleStr.includes("sudoku")) resolvedSlug = "sudoku";
      else if (gameTitleStr.includes("tango")) resolvedSlug = "tango";
      else if (gameTitleStr.includes("zip") || gameTitleStr.includes("path")) resolvedSlug = "zip";
      else if (gameTitleStr.includes("pattern") || gameTitleStr.includes("memory")) resolvedSlug = "pattern_memory";
      else {
        const fallbackSlugs = ["mahjong", "sudoku", "zip", "tango"];
        resolvedSlug = fallbackSlugs[index % fallbackSlugs.length];
      }
      catalogInfo = GAME_CATALOG_MAP[resolvedSlug] || GAME_CATALOG_MAP[String(resolvedSlug).toLowerCase()] || gamesCatalog[0];
    }

    const title = (typeof gameItem === "object" && (gameItem?.title || gameItem?.game?.title || gameItem?.game?.name)) || catalogInfo.title || `Module ${index + 1}: ${catalogInfo.title || "Game Challenge"}`;

    return {
      id: `sec-game-${index + 1}`,
      type: "game",
      gameId: resolvedSlug,
      slug: resolvedSlug,
      gameType: resolvedSlug,
      title,
      description: catalogInfo.description || "",
      config: typeof gameItem === "object" ? (gameItem.config || {}) : {},
    };
  });

  // 2. Extract real questions from Question Bank / Assessment Creator / Prisma AssessmentQuestion relations
  const rawQuestions =
    (Array.isArray(assessment.questions) && assessment.questions.length > 0 ? assessment.questions : null) ||
    (Array.isArray(assessment.AssessmentQuestion) && assessment.AssessmentQuestion.length > 0 ? assessment.AssessmentQuestion : null) ||
    (Array.isArray(assessment.AssessmentQuestions) && assessment.AssessmentQuestions.length > 0 ? assessment.AssessmentQuestions : null) ||
    (Array.isArray(assessment.assessmentQuestion) && assessment.assessmentQuestion.length > 0 ? assessment.assessmentQuestion : null) ||
    (Array.isArray(assessment.assessmentQuestions) && assessment.assessmentQuestions.length > 0 ? assessment.assessmentQuestions : null) ||
    (Array.isArray(assessment.selectedQuestionIds) && assessment.selectedQuestionIds.length > 0 ? assessment.selectedQuestionIds : null) ||
    (Array.isArray(assessment.quizzes) && assessment.quizzes.length > 0 ? assessment.quizzes.flatMap((quiz) => quiz.questions || []) : null) ||
    [];

  const parsedQuestions = rawQuestions.map(normalizeRuntimeQuestion).filter(Boolean);

  const quizSections = [];
  if (parsedQuestions.length > 0) {
    const quizTitle = assessment.title
      ? `${assessment.title} - Quiz`
      : `Technical & Domain Knowledge Assessment`;

    quizSections.push({
      id: "sec-quiz-main",
      type: "quiz",
      title: gameSections.length > 0 ? `Module ${gameSections.length + 1}: ${quizTitle}` : quizTitle,
      description: "Answer the multiple choice questions to evaluate your domain knowledge.",
      questions: parsedQuestions,
    });
  }

  // 3. Fallback to structured sections array if no rawQuestions found
  if (quizSections.length === 0 && Array.isArray(assessment.sections) && assessment.sections.length > 0) {
    return assessment.sections.map((section, index) => {
      const slug = section.slug || section.gameSlug || section.gameId || section.id;
      const questions = Array.isArray(section.questions)
        ? section.questions.map(normalizeRuntimeQuestion).filter(Boolean)
        : [];

      return {
        ...section,
        id: section.id ?? `section-${index + 1}`,
        type: section.type ?? (questions.length > 0 ? "quiz" : "game"),
        slug: slug,
        title: section.title ?? `Section ${index + 1}`,
        questions: questions.length > 0 ? questions : undefined,
      };
    });
  }

  const combinedSections = [...gameSections, ...quizSections];
  return combinedSections;
};
