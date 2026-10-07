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

const getStorageKey = () => {
  if (typeof window === "undefined") return STORAGE_KEY;
  const compId =
    localStorage.getItem("companyId") ||
    localStorage.getItem("active_company_id") ||
    sessionStorage.getItem("companyId") ||
    "";
  return compId ? `${STORAGE_KEY}_${compId}` : STORAGE_KEY;
};

export const getAllCompanyGameConfigs = () => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const key = getStorageKey();
    const raw = localStorage.getItem(key) || (key !== STORAGE_KEY ? localStorage.getItem(STORAGE_KEY) : null);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

export const getCompanyGameConfig = (gameSlugOrId) => {
  if (!gameSlugOrId) return null;
  const rawKey = String(gameSlugOrId).toLowerCase().trim();
  const key = normalizeKey(gameSlugOrId);
  const all = getAllCompanyGameConfigs();
  return all[rawKey] || all[key] || null;
};

export const saveCompanyGameConfig = (gameSlugOrId, newConfig = {}) => {
  const key = normalizeKey(gameSlugOrId);
  const rawKey = String(gameSlugOrId || "").toLowerCase().trim();
  const current = getAllCompanyGameConfigs();

  const entry = {
    ...(current[key] || {}),
    ...(rawKey && current[rawKey] ? current[rawKey] : {}),
    ...newConfig,
  };

  const updated = {
    ...current,
    [key]: entry,
    ...(rawKey ? { [rawKey]: entry } : {}),
  };

  if (typeof window !== "undefined") {
    try {
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(updated));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("hirequest_game_configs_updated", { detail: updated }));
    } catch { }
  }

  return updated[key];
};

export const getEffectiveGameRuntimeConfig = (gameSlugOrId, assessmentConfig = {}) => {
  const companyConfig = getCompanyGameConfig(gameSlugOrId);
  const diff = String(
    assessmentConfig?.difficulty ||
    companyConfig?.difficulty ||
    "medium"
  ).toLowerCase();
  return {
    ...companyConfig,
    ...assessmentConfig,
    difficulty: diff,
  };
};
