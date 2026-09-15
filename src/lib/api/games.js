import axiosClient from "./axiosClient";
import { games as fallbackGames } from "@/features/games/data";

/**
 * Fetch all cognitive games available on the platform
 * Endpoint: GET /api/v1/games
 */
export const getGames = async () => {
  try {
    const res = await axiosClient.get("/games");
    const data = res?.data?.data || res?.data || res;
    if (Array.isArray(data) && data.length > 0) return data;
    if (Array.isArray(data?.games) && data.games.length > 0) return data.games;
    return fallbackGames;
  } catch (err) {
    console.warn("Falling back to local games catalog:", err?.message);
    return fallbackGames;
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
