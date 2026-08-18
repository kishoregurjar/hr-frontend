import { activityData } from "../data/activity-data";

const useActivityData = () => {
  return {
    data: activityData,
    isLoading: false,
    error: null,
  };
};

export default useActivityData;
