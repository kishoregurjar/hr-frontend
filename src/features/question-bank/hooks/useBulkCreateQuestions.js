import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUESTION_QUERY_KEYS } from "../constants/queryKeys";
import { questionsService } from "../services";

const useBulkCreateQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questions) => questionsService.bulkCreate(questions),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUESTION_QUERY_KEYS.all,
      });
    },
  });
};

export default useBulkCreateQuestions;
