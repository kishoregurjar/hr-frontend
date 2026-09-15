"use client";

import { useQuery } from "@tanstack/react-query";
import { getGames } from "@/lib/api/games";
import { games as fallbackCatalog } from "@/features/games/data";

export const GAMES_QUERY_KEY = ["games"];

export const useGamesQuery = (options = {}) => {
  return useQuery({
    queryKey: GAMES_QUERY_KEY,
    queryFn: async () => {
      const apiGames = await getGames();
      if (!Array.isArray(apiGames) || apiGames.length === 0) {
        return fallbackCatalog;
      }
      return apiGames;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    ...options,
  });
};
