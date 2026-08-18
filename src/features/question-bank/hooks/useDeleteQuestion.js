import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { QUESTION_QUERY_KEYS } from "../constants/queryKeys";
import { questionsService } from "../services";

const useDeleteQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) =>
      questionsService.remove(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUESTION_QUERY_KEYS.all,
      });
    },
  });
};

export default useDeleteQuestion;
