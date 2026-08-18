import { recentCandidates } from "../data/recent-candidates";

const useRecentCandidates = () => {
  return {
    data: recentCandidates,
    isLoading: false,
    error: null,
  };
};

export default useRecentCandidates;
