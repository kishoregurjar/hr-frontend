import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUESTION_QUERY_KEYS } from "../constants/queryKeys";
import { questionsService } from "../services";

const useUpdateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) =>
      questionsService.update(id, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUESTION_QUERY_KEYS.all,
      });

      queryClient.invalidateQueries({
        queryKey: QUESTION_QUERY_KEYS.detail(
          variables.id
        ),
      });
    },
  });
};

export default useUpdateQuestion;
