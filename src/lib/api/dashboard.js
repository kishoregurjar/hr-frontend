import axiosClient from "./axiosClient";

export const getDashboardOverview = async () => {
  const response = await axiosClient.get("/dashboard/overview");
  return response?.data?.data || response?.data || response;
};
