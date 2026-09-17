/**
 * Normalizes an assessment object into a structured list of runtime modules.
 *
 * Standard 2-Module Architecture:
 *  - Module 1: Cognitive & Behavioral Games (bundle of all selected games)
 *  - Module 2: Technical & Domain MCQ Quiz (bundle of all selected questions)
 *  - Future modules (Coding, Video, etc.) can seamlessly append as Module 3, Module 4...
 */

import { games as gamesCatalog } from "@/features/games/data";
import { getEffectiveGameRuntimeConfig } from "@/features/games/utils/gameConfigStore";

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
  if (opt === null || opt === undefined) return "";
  if (typeof opt === "string") return opt.trim();
  if (typeof opt === "number" || typeof opt === "boolean") return String(opt);

  const directText =
    opt.optionText ??
    opt.text ??
    opt.option_text ??
    opt.content ??
    opt.value ??
    opt.name ??
    opt.label ??
    opt.title;

  if (directText !== undefined && directText !== null) {
    const trimmed = String(directText).trim();
    if (trimmed.length > 0) return trimmed;
  }

  return "";
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
        optionText: val.trim(),
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
        return { id: optionKey, label: opt, text: opt, optionText: opt };
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
        optionText,
        isCorrect: Boolean(opt.isCorrect || opt.is_correct),
      };
    });

    if (parsedList.length > 0) {
      return parsedList;
    }
  }

  // 4. If flat options were found, use them
  if (flatFound.length > 0) {
    return flatFound;
  }

  // 5. Fallback 4 standard options if none found
  return [
    { id: "opt_A", label: "Option A", text: "Option A", optionText: "Option A" },
    { id: "opt_B", label: "Option B", text: "Option B", optionText: "Option B" },
    { id: "opt_C", label: "Option C", text: "Option C", optionText: "Option C" },
    { id: "opt_D", label: "Option D", text: "Option D", optionText: "Option D" },
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
    (qObj.content && qObj.content.trim() && !/^Question\s+\d+$/i.test(qObj.content.trim()) ? qObj.content.trim() : null) ||
    (qObj.question && qObj.question.trim() && !/^Question\s+\d+$/i.test(qObj.question.trim()) ? qObj.question.trim() : null) ||
    (qObj.title && qObj.title.trim() && !/^Question\s+\d+$/i.test(qObj.title.trim()) ? qObj.title.trim() : null) ||
    (qObj.text && qObj.text.trim() ? qObj.text.trim() : null) ||
    (rawQ.content && rawQ.content.trim() && !/^Question\s+\d+$/i.test(rawQ.content.trim()) ? rawQ.content.trim() : null) ||
    (rawQ.question && rawQ.question.trim() && !/^Question\s+\d+$/i.test(rawQ.question.trim()) ? rawQ.question.trim() : null) ||
    (rawQ.title && rawQ.title.trim() && !/^Question\s+\d+$/i.test(rawQ.title.trim()) ? rawQ.title.trim() : null) ||
    qObj.content ||
    qObj.title ||
    qObj.question ||
    rawQ.title ||
    rawQ.question ||
    `Question ${index + 1}`;
  
  let options = normalizeRuntimeOptions(
    qObj.options || qObj.Option || qObj.QuestionOption || qObj.questionOptions || rawQ.options || rawQ.Option,
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
    content: qObj.content || rawQ.content || title,
    codeSnippet: qObj.codeSnippet || rawQ.codeSnippet || null,
    explanation: qObj.explanation || rawQ.explanation || null,
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

  const parsedGames = rawGames.map((gameItem, index) => {
    let resolvedSlug = typeof gameItem === "string"
      ? gameItem
      : (gameItem?.game?.code || gameItem?.game?.slug || gameItem?.slug || gameItem?.code || gameItem?.gameId || gameItem?.id || `game-${index + 1}`);

    let catalogInfo = GAME_CATALOG_MAP[resolvedSlug] || GAME_CATALOG_MAP[String(resolvedSlug).toLowerCase()] || {};

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

    const title = (typeof gameItem === "object" && (gameItem?.title || gameItem?.game?.title || gameItem?.game?.name)) || catalogInfo.title || `Game ${index + 1}: ${catalogInfo.title || "Challenge"}`;

    const itemConfig = typeof gameItem === "object" ? (gameItem.config || {}) : {};
    const effectiveConfig = getEffectiveGameRuntimeConfig(resolvedSlug, {
      ...itemConfig,
      difficulty: itemConfig.difficulty || assessment?.difficulty || "easy",
    });

    return {
      id: `game-${index + 1}`,
      gameId: resolvedSlug,
      slug: resolvedSlug,
      gameType: resolvedSlug,
      title,
      description: catalogInfo.description || "",
      category: catalogInfo.category || "Cognitive Assessment",
      duration: catalogInfo.duration || 7,
      skill: catalogInfo.skill || "Problem Solving",
      config: effectiveConfig,
    };
  });

  // 2. Extract questions
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

  // ── Build Unified 2-Module Structure ───────────────────────────
  const runtimeModules = [];

  // MODULE 1: Cognitive Games Challenge (Bundle of all selected games)
  if (parsedGames.length > 0) {
    runtimeModules.push({
      id: "module-cognitive-games",
      type: "game",
      title: "Cognitive & Behavioral Games",
      description: `Interactive problem-solving challenge consisting of ${parsedGames.length} cognitive ${parsedGames.length === 1 ? "game" : "games"}.`,
      games: parsedGames,
      // Default to first game config for backward compatibility
      slug: parsedGames[0].slug,
      gameId: parsedGames[0].gameId,
      config: parsedGames[0].config,
    });
  }

  // MODULE 2: Technical & Domain MCQ Quiz
  if (parsedQuestions.length > 0) {
    const quizTitle = assessment.title
      ? `${assessment.title} - Technical Quiz`
      : "Technical & Domain Knowledge";

    runtimeModules.push({
      id: "module-technical-quiz",
      type: "quiz",
      title: quizTitle,
      description: `Multiple choice questions (${parsedQuestions.length} questions) evaluating domain knowledge and core concepts.`,
      questions: parsedQuestions,
    });
  }

  // 3. Fallback to structured sections array if no rawGames or rawQuestions found
  if (runtimeModules.length === 0 && Array.isArray(assessment.sections) && assessment.sections.length > 0) {
    return assessment.sections.map((section, index) => {
      const slug = section.slug || section.gameSlug || section.gameId || section.id;
      const questions = Array.isArray(section.questions)
        ? section.questions.map(normalizeRuntimeQuestion).filter(Boolean)
        : [];

      return {
        ...section,
        id: section.id ?? `module-${index + 1}`,
        type: section.type ?? (questions.length > 0 ? "quiz" : "game"),
        slug: slug,
        title: section.title ?? `Module ${index + 1}`,
        questions: questions.length > 0 ? questions : undefined,
      };
    });
  }

  return runtimeModules;
};
