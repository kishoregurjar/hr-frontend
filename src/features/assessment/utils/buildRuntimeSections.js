/**
 * Normalizes an assessment object into a flat list of runtime sections.
 *
 * Priority:
 *  1. assessment.sections[]  — structured model (future backend shape)
 *  2. assessment.games / assessment.quizzes — legacy flat arrays with questions
 *  3. assessment.gameIds / assessment.questionIds — fallback generator
 *  4. Default sample sections for testing
 */

const DEFAULT_SAMPLE_SECTIONS = [
  {
    id: "sec-game-1",
    type: "game",
    title: "Pattern Memory Game",
    description: "Memorize and repeat visual patterns under time limits.",
  },
  {
    id: "sec-quiz-1",
    type: "quiz",
    title: "JavaScript Fundamentals",
    questions: [
      {
        id: "q1",
        question: "What does the strict equality operator (===) compare in JavaScript?",
        options: [
          { id: "a", label: "Only value" },
          { id: "b", label: "Only type" },
          { id: "c", label: "Both value and type" },
          { id: "d", label: "Memory reference only" },
        ],
      },
      {
        id: "q2",
        question: "Which array method creates a new array populated with the results of calling a provided function on every element?",
        options: [
          { id: "a", label: "forEach()" },
          { id: "b", label: "map()" },
          { id: "c", label: "filter()" },
          { id: "d", label: "reduce()" },
        ],
      },
      {
        id: "q3",
        question: "What is the result of typeof NaN in JavaScript?",
        options: [
          { id: "a", label: "'number'" },
          { id: "b", label: "'nan'" },
          { id: "c", label: "'undefined'" },
          { id: "d", label: "'object'" },
        ],
      },
    ],
  },
  {
    id: "sec-game-2",
    type: "game",
    title: "Logic Sequence Escape",
    description: "Solve spatial logic sequences to escape the maze.",
  },
  {
    id: "sec-quiz-2",
    type: "quiz",
    title: "React & Next.js Concepts",
    questions: [
      {
        id: "q1",
        question: "What hook should be used to perform side effects in a React function component?",
        options: [
          { id: "a", label: "useState" },
          { id: "b", label: "useEffect" },
          { id: "c", label: "useContext" },
          { id: "d", label: "useReducer" },
        ],
      },
      {
        id: "q2",
        question: "In Next.js App Router, which file name defines a page route?",
        options: [
          { id: "a", label: "index.jsx" },
          { id: "b", label: "route.jsx" },
          { id: "c", label: "page.jsx" },
          { id: "d", label: "component.jsx" },
        ],
      },
    ],
  },
];

export const buildRuntimeSections = (assessment) => {
  if (!assessment) return [];

  // 1. Structured sections array
  if (Array.isArray(assessment.sections) && assessment.sections.length > 0) {
    return assessment.sections.map((section, index) => ({
      ...section,
      id: section.id ?? `section-${index + 1}`,
      type: section.type ?? "unknown",
      title: section.title ?? `Section ${index + 1}`,
    }));
  }

  // 2. Legacy flat arrays: games / quizzes with questions
  const games = Array.isArray(assessment.games) ? assessment.games : [];
  const quizzes = Array.isArray(assessment.quizzes) ? assessment.quizzes : [];

  if (games.length > 0 || quizzes.length > 0) {
    return [
      ...games.map((game, index) => ({
        ...game,
        id: game.id ?? `game-${index + 1}`,
        type: "game",
        title: game.title ?? `Game ${index + 1}`,
      })),
      ...quizzes.map((quiz, index) => ({
        ...quiz,
        id: quiz.id ?? `quiz-${index + 1}`,
        type: "quiz",
        title: quiz.title ?? `Quiz ${index + 1}`,
      })),
    ];
  }

  // 3. Fallback sample sections for mock assessments with gameIds/questionIds or empty arrays
  return DEFAULT_SAMPLE_SECTIONS;
};
