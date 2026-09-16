/**
 * Central Company Game Configuration Store
 * Handles persistent game calibration (Difficulty, Duration, Passing Score, Status)
 * set by the Company Owner / HR in the Cognitive Games Dashboard (/games).
 */

const STORAGE_KEY = "hirequest_company_game_configs";

const DEFAULT_CONFIGS = {
  mahjong: {
    difficulty: "Easy",
    duration: 7,
    passingScore: 70,
    status: "Active",
  },
  sudoku: {
    difficulty: "Easy",
    duration: 10,
    passingScore: 70,
    status: "Active",
  },
  zip: {
    difficulty: "Easy",
    duration: 6,
    passingScore: 70,
    status: "Active",
  },
  tango: {
    difficulty: "Easy",
    duration: 8,
    passingScore: 70,
    status: "Active",
  },
  pattern_memory: {
    difficulty: "Easy",
    duration: 6,
    passingScore: 70,
    status: "Active",
  },
  maze_escape: {
    difficulty: "Easy",
    duration: 8,
    passingScore: 70,
    status: "Active",
  },
  card_match: {
    difficulty: "Easy",
    duration: 5,
    passingScore: 70,
    status: "Active",
  },
};

const normalizeKey = (key = "") => {
  const str = String(key || "").toLowerCase().trim();
  if (str.includes("mahjong")) return "mahjong";
  if (str.includes("sudoku")) return "sudoku";
  if (str.includes("zip") || str.includes("pathfinder")) return "zip";
  if (str.includes("tango")) return "tango";
  if (str.includes("pattern")) return "pattern_memory";
  if (str.includes("maze")) return "maze_escape";
  if (str.includes("card") || str.includes("memory")) return "card_match";
  return str.replace(/^game_/, "").replace(/-/g, "_");
};

export const getAllCompanyGameConfigs = () => {
  if (typeof window === "undefined") {
    return { ...DEFAULT_CONFIGS };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CONFIGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONFIGS, ...parsed };
  } catch {
    return { ...DEFAULT_CONFIGS };
  }
};

export const getCompanyGameConfig = (gameSlugOrId) => {
  const key = normalizeKey(gameSlugOrId);
  const all = getAllCompanyGameConfigs();
  return all[key] || DEFAULT_CONFIGS[key] || { difficulty: "Easy", duration: 7, passingScore: 70, status: "Active" };
};

export const saveCompanyGameConfig = (gameSlugOrId, newConfig = {}) => {
  const key = normalizeKey(gameSlugOrId);
  const current = getAllCompanyGameConfigs();

  const updated = {
    ...current,
    [key]: {
      ...(current[key] || DEFAULT_CONFIGS[key] || {}),
      ...newConfig,
      difficulty: newConfig.difficulty || current[key]?.difficulty || "Easy",
    },
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("hirequest_game_configs_updated", { detail: updated }));
    } catch {}
  }

  return updated[key];
};

export const getEffectiveGameRuntimeConfig = (gameSlugOrId, assessmentConfig = {}) => {
  const companyConfig = getCompanyGameConfig(gameSlugOrId);
  const diff = (
    assessmentConfig?.difficulty ||
    companyConfig?.difficulty ||
    "easy"
  ).toLowerCase();

  return {
    ...companyConfig,
    ...assessmentConfig,
    difficulty: diff,
  };
};
