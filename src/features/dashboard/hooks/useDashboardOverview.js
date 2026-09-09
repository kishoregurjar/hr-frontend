import { useQuery } from "@tanstack/react-query";
import { getDashboardOverview } from "@/lib/api/dashboard";

export const useDashboardOverview = () => {
  return useQuery({
    queryKey: ["dashboardOverview"],
    queryFn: getDashboardOverview,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export default useDashboardOverview;
