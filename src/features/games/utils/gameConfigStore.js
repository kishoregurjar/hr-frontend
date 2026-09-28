/**
 * Central Company Game Configuration Store
 * Handles persistent game calibration (Difficulty, Duration, Passing Score, Status)
 * set by the Company Owner / HR in the Cognitive Games Dashboard (/games).
 */

const STORAGE_KEY = "hirequest_company_game_configs";

const DEFAULT_CONFIGS = {};

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
    return {};
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

export const getCompanyGameConfig = (gameSlugOrId) => {
  const key = normalizeKey(gameSlugOrId);
  const all = getAllCompanyGameConfigs();
  return all[key] || null;
};

export const saveCompanyGameConfig = (gameSlugOrId, newConfig = {}) => {
  const key = normalizeKey(gameSlugOrId);
  const current = getAllCompanyGameConfigs();

  const updated = {
    ...current,
    [key]: {
      ...(current[key] || {}),
      ...newConfig,
    },
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("hirequest_game_configs_updated", { detail: updated }));
    } catch { }
  }

  return updated[key];
};

export const getEffectiveGameRuntimeConfig = (gameSlugOrId, assessmentConfig = {}) => {
  const companyConfig = getCompanyGameConfig(gameSlugOrId);
  const diff = (
    companyConfig?.difficulty ||
    assessmentConfig?.difficulty ||
    "easy"
  ).toLowerCase();
  return {
    ...assessmentConfig,
    ...companyConfig,
    difficulty: diff,
  };
};
