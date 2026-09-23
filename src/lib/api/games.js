import axiosClient from "./axiosClient";

/**
 * Fetch all cognitive games available on the platform
 * Endpoint: GET /api/v1/games
 */
export const getGames = async () => {
  try {
    const res = await axiosClient.get("/games");
    const data = res?.data?.data || res?.data || res;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.games)) return data.games;
    return [];
  } catch (err) {
    console.error("Failed to fetch games from API:", err);
    return [];
  }
};

/**
 * Fetch a single game by slug or ID
 * Endpoint: GET /api/v1/games/:slug
 */
export const getGameBySlug = async (slug) => {
  try {
    const res = await axiosClient.get(`/games/${slug}`);
    return res?.data?.data || res?.data || res;
  } catch (err) {
    console.error(`Failed to fetch game ${slug}:`, err);
    throw err;
  }
};

/**
 * Update game configuration for the current company (Difficulty, Duration, Passing Score, Status)
 * Endpoint: PATCH /api/v1/games/:gameId/config
 */
export const updateGameConfig = async (gameSlugOrId, configData) => {
  try {
    const res = await axiosClient.patch(`/games/${gameSlugOrId}/config`, configData);
    return res?.data?.data || res?.data || res;
  } catch (err) {
    console.error(`Failed to update game config for ${gameSlugOrId}:`, err);
    throw err;
  }
};

