import { useQuery } from "@tanstack/react-query";
import { QUESTION_QUERY_KEYS } from "../constants/queryKeys";
import { questionsService } from "../services";

const useQuestionsQuery = () => {
  return useQuery({
    queryKey: QUESTION_QUERY_KEYS.lists(),
    queryFn: questionsService.getAll,
    select: (response) => response?.data || [], // Map backend `{ success, data }` envelop to raw questions array
  });
};

export default useQuestionsQuery;
