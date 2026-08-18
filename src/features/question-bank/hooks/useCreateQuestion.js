import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUESTION_QUERY_KEYS } from "../constants/queryKeys";
import { questionsService } from "../services";

const useCreateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => questionsService.create(data),
    onSuccess: () => {
      // Invalidate questions query cache to trigger automatic list refresh
      queryClient.invalidateQueries({
        queryKey: QUESTION_QUERY_KEYS.all,
      });
    },
  });
};

export default useCreateQuestion;
