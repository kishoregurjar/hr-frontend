import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUESTION_QUERY_KEYS } from "../constants/queryKeys";
import { questionsService } from "../services";
import { normalizeQuestion } from "@/lib/api/questions";

const useCreateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => questionsService.create(data),
    onSuccess: (resData) => {
      const created = normalizeQuestion(resData?.data || resData);
      if (created) {
        queryClient.setQueryData(QUESTION_QUERY_KEYS.lists(), (old) => {
          const oldList = Array.isArray(old) ? old : [];
          return [created, ...oldList.filter((q) => q.id !== created.id)];
        });
      }
      queryClient.invalidateQueries({
        queryKey: QUESTION_QUERY_KEYS.all,
      });
    },
  });
};

export default useCreateQuestion;
