"use client";

import { useQuery } from "@tanstack/react-query";
import { getGames } from "@/lib/api/games";

export const GAMES_QUERY_KEY = ["games"];

export const useGamesQuery = (options = {}) => {
  return useQuery({
    queryKey: GAMES_QUERY_KEY,
    queryFn: async () => {
      const apiGames = await getGames();
      return Array.isArray(apiGames) ? apiGames : [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes cache
    ...options,
  });
};
