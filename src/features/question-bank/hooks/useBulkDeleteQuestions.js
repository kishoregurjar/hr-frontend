import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { QUESTION_QUERY_KEYS } from "../constants/queryKeys";
import { questionsService } from "../services";

const useBulkDeleteQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, all = false }) => {
      if (all) {
        return questionsService.removeAll();
      }
      return questionsService.bulkRemove(ids);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUESTION_QUERY_KEYS.all,
      });
    },
  });
};

export default useBulkDeleteQuestions;
