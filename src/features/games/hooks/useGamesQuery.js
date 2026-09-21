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
    staleTime: 5000,
    refetchOnWindowFocus: true,
    ...options,
  });
};
