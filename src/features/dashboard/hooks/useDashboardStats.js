import { dashboardStats } from "../data/dashboard-data";

const useDashboardStats = () => {
  return {
    data: dashboardStats,
    isLoading: false,
    error: null,
  };
};

export default useDashboardStats;
