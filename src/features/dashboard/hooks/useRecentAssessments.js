import { recentAssessments } from "../data/recent-assessments";

const useRecentAssessments = () => {
  return {
    data: recentAssessments,
    isLoading: false,
    error: null,
  };
};

export default useRecentAssessments;
