import { useQuery } from "@tanstack/react-query";
import { QUESTION_QUERY_KEYS } from "../constants/queryKeys";
import { questionsService } from "../services";

const useQuestionsQuery = () => {
  return useQuery({
    queryKey: QUESTION_QUERY_KEYS.lists(),
    queryFn: questionsService.getAll,
    select: (response) => response?.data || [], // Map backend `{ success, data }` envelop to raw questions array
    staleTime: 5 * 60 * 1000,       // 5 Minutes Cache
    gcTime: 10 * 60 * 1000,        // Keep in Memory
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export default useQuestionsQuery;
