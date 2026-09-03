/**
 * Normalizes an assessment object into a flat list of runtime sections.
 *
 * Priority:
 *  1. assessment.sections[]  — structured model
 *  2. assessment.games / assessment.gameIds — flat games array
 *  3. Default sample sections featuring Zip, Tango, Sudoku, Mahjong
 */

import { games as gamesCatalog } from "@/features/games/data";

const GAME_CATALOG_MAP = gamesCatalog.reduce((acc, g) => {
  acc[g.id] = g;
  acc[g.slug] = g;
  return acc;
}, {});

const DEFAULT_SAMPLE_SECTIONS = [
  {
    id: "sec-game-zip",
    type: "game",
    gameId: "zip",
    slug: "zip",
    title: "Module 1: Zip Grid Pathfinder",
    description: "Connect sequential numbered checkpoints across the maze grid without crossing wall barriers.",
  },
  {
    id: "sec-game-tango",
    type: "game",
    gameId: "tango",
    slug: "tango",
    title: "Module 2: Tango Spatial Deduction",
    description: "Solve the Sun and Moon deduction matrix adhering to row/col balance and constraint rules.",
  },
  {
    id: "sec-game-sudoku",
    type: "game",
    gameId: "sudoku",
    slug: "sudoku",
    title: "Module 3: Mini Sudoku 6x6 Challenge",
    description: "Fill the 6x6 grid with unique digits in each row, column, and 2x3 block.",
  },
  {
    id: "sec-game-mahjong",
    type: "game",
    gameId: "mahjong",
    slug: "mahjong",
    title: "Module 4: Mahjong Tile Match Strategy",
    description: "Match and slide authentic Mahjong tiles using line-of-sight clearing and push tactics.",
  },
  {
    id: "sec-quiz-1",
    type: "quiz",
    title: "Module 5: Engineering & Logical Problem Solving",
    questions: [
      {
        id: "q1",
        question: "What is the primary advantage of idempotent API operations in distributed microservices?",
        options: [
          { id: "a", label: "Guarantees zero database read latency" },
          { id: "b", label: "Allows safe automatic retries on network failures without duplicate side-effects" },
          { id: "c", label: "Eliminates the requirement for transaction logs" },
          { id: "d", label: "Replaces distributed caching layers" },
        ],
      },
      {
        id: "q2",
        question: "In JavaScript, what data structure guarantees unique values and O(1) average lookup time?",
        options: [
          { id: "a", label: "WeakRef" },
          { id: "b", label: "Set" },
          { id: "c", label: "Array.prototype.indexOf" },
          { id: "d", label: "TypedArray" },
        ],
      },
      {
        id: "q3",
        question: "Which pattern is optimal for decoupling component state from side effects in React?",
        options: [
          { id: "a", label: "Custom hooks with unidirectional data flow" },
          { id: "b", label: "Mutating window global objects" },
          { id: "c", label: "Direct DOM manipulation via document.getElementById" },
          { id: "d", label: "Nesting setState synchronously within render loops" },
        ],
      },
    ],
  },
];

export const buildRuntimeSections = (assessment) => {
  if (!assessment) return DEFAULT_SAMPLE_SECTIONS;

  // 1. Structured sections array
  if (Array.isArray(assessment.sections) && assessment.sections.length > 0) {
    return assessment.sections.map((section, index) => {
      const slug = section.slug || section.gameSlug || section.gameId || section.id;
      return {
        ...section,
        id: section.id ?? `section-${index + 1}`,
        type: section.type ?? "game",
        slug: slug,
        title: section.title ?? `Section ${index + 1}`,
      };
    });
  }

  // 2. Games extracted from games, gameIds, or selectedGameIds
  const rawGames = Array.isArray(assessment.games) && assessment.games.length > 0
    ? assessment.games
    : Array.isArray(assessment.gameIds) && assessment.gameIds.length > 0
    ? assessment.gameIds
    : Array.isArray(assessment.selectedGameIds) && assessment.selectedGameIds.length > 0
    ? assessment.selectedGameIds
    : [];

  const rawQuizzes = Array.isArray(assessment.quizzes) ? assessment.quizzes : [];

  if (rawGames.length > 0 || rawQuizzes.length > 0) {
    const gameSections = rawGames.map((gameItem, index) => {
      const idOrSlug = typeof gameItem === "string" ? gameItem : (gameItem?.id || gameItem?.slug || `game-${index + 1}`);
      const catalogInfo = GAME_CATALOG_MAP[idOrSlug] || {};
      const title = (typeof gameItem === "object" && gameItem?.title) || catalogInfo.title || `Game Challenge ${index + 1}`;

      return {
        id: `sec-game-${index + 1}`,
        type: "game",
        gameId: idOrSlug,
        slug: idOrSlug,
        gameType: idOrSlug,
        title,
        config: typeof gameItem === "object" ? gameItem.config : {},
      };
    });

    const quizSections = rawQuizzes.map((quiz, index) => ({
      ...quiz,
      id: quiz.id ?? `sec-quiz-${index + 1}`,
      type: "quiz",
      title: quiz.title ?? `Quiz Assessment ${index + 1}`,
    }));

    return [...gameSections, ...quizSections];
  }

  // 3. Fallback sample sections with all 4 games
  return DEFAULT_SAMPLE_SECTIONS;
};
