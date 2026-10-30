/**
 * Dynamic Game Timer & Difficulty Benchmarking Utility
 * Maps each cognitive game and difficulty level (EASY, MEDIUM, HARD)
 * to calibrated duration benchmarks (in minutes and seconds).
 */

const normalizeGameKey = (key = "") => {
  const str = String(key || "").toLowerCase().trim();
  if (str.includes("mahjong")) return "mahjong";
  if (str.includes("sudoku")) return "sudoku";
  if (str.includes("zip") || str.includes("pathfinder")) return "zip";
  if (str.includes("tango")) return "tango";
  if (str.includes("queen")) return "nqueens";
  if (str.includes("pattern")) return "pattern_memory";
  if (str.includes("maze")) return "maze_escape";
  if (str.includes("card") || str.includes("memory")) return "card_match";
  return str.replace(/^game_/, "").replace(/-/g, "_");
};

export const GAME_DIFFICULTY_DURATIONS = Object.freeze({
  zip: Object.freeze({
    EASY: 2,       // 2.0 mins (120s) - 5x5 grid, ample clues
    MEDIUM: 3.5,   // 3.5 mins (210s) - 6x6 grid, standard clues
    HARD: 5,       // 5.0 mins (300s) - 7x7 grid, maze constraints
  }),
  tango: Object.freeze({
    EASY: 2.5,     // 2.5 mins (150s) - 6x6 grid with rich starting hints
    MEDIUM: 3.5,   // 3.5 mins (210s) - 6x6 grid with fewer clues
    HARD: 5,       // 5.0 mins (300s) - 8x8 grid with complex constraints
  }),
  sudoku: Object.freeze({
    EASY: 2.5,     // 2.5 mins (150s) - 4x4 or 6x6 with many prefilled cells
    MEDIUM: 4,     // 4.0 mins (240s) - 6x6 standard challenge
    HARD: 6,       // 6.0 mins (360s) - 6x6 minimal clues or 9x9 block
  }),
  mahjong: Object.freeze({
    EASY: 2,       // 2.0 mins (120s) - 10 pairs (4x5)
    MEDIUM: 3,     // 3.0 mins (180s) - 15 pairs (5x6)
    HARD: 4.5,     // 4.5 mins (270s) - 21 pairs (6x7)
  }),
  nqueens: Object.freeze({
    EASY: 2.5,     // 2.5 mins (150s) - 6 Queens board
    MEDIUM: 3.5,   // 3.5 mins (210s) - 8 Queens classic board
    HARD: 5,       // 5.0 mins (300s) - 10 Queens complex board
  }),
  card_match: Object.freeze({
    EASY: 1,       // 1.0 min (60s) - 8 cards (4 pairs)
    MEDIUM: 1.5,   // 1.5 mins (90s) - 12 cards (6 pairs)
    HARD: 2.5,     // 2.5 mins (150s) - 16 cards (8 pairs)
  }),
  maze_escape: Object.freeze({
    EASY: 1,       // 1.0 min (60s) - Direct 5x5 maze
    MEDIUM: 1.5,   // 1.5 mins (90s) - 6x6 maze with branches
    HARD: 2.5,     // 2.5 mins (150s) - 8x8 maze with dead ends
  }),
  pattern_memory: Object.freeze({
    EASY: 1.5,     // 1.5 mins (90s)
    MEDIUM: 2.5,   // 2.5 mins (150s)
    HARD: 4,       // 4.0 mins (240s)
  }),
});

export const DEFAULT_DIFFICULTY_DURATIONS = Object.freeze({
  EASY: 2,
  MEDIUM: 3.5,
  HARD: 5,
});

/**
 * Returns calibrated duration in minutes for a given game and difficulty.
 * @param {string} gameSlugOrId
 * @param {string} difficulty ('EASY' | 'MEDIUM' | 'HARD')
 * @returns {number} duration in minutes
 */
export const getGameDurationForDifficulty = (gameSlugOrId, difficulty = "MEDIUM") => {
  const key = normalizeGameKey(gameSlugOrId);
  const diff = String(difficulty || "MEDIUM").toUpperCase();
  const gameDurations = GAME_DIFFICULTY_DURATIONS[key];

  if (gameDurations && typeof gameDurations[diff] === "number") {
    return gameDurations[diff];
  }

  return DEFAULT_DIFFICULTY_DURATIONS[diff] || DEFAULT_DIFFICULTY_DURATIONS.MEDIUM;
};

/**
 * Formats duration nicely for badges and displays (e.g. 2 -> "2m", 3.5 -> "3m 30s")
 * @param {number} minutes
 * @returns {string}
 */
export const formatDurationDisplay = (minutes) => {
  const mins = Number(minutes) || 0;
  const wholeMins = Math.floor(mins);
  const secs = Math.round((mins - wholeMins) * 60);

  if (secs > 0) {
    return `${wholeMins}m ${secs}s`;
  }
  return `${wholeMins}m`;
};
