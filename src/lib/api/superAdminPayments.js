import axiosClient from "./axiosClient";

/**
 * Super Admin Revenue Overview
 * GET /api/v1/super-admin/payments/overview
 */
export const getAdminRevenueOverview = async (params = {}) => {
  const res = await axiosClient.get("/super-admin/payments/overview", { params });
  return res?.data?.data || res?.data;
};

/**
 * Super Admin Revenue Charts Data
 * GET /api/v1/super-admin/payments/charts
 */
export const getAdminRevenueCharts = async (params = {}) => {
  const res = await axiosClient.get("/super-admin/payments/charts", { params });
  return res?.data?.data || res?.data;
};

/**
 * Super Admin Payment Transactions List (Paginated, Searchable, Filterable)
 * GET /api/v1/super-admin/payments/transactions
 */
export const getAdminPaymentTransactions = async (params = {}) => {
  const res = await axiosClient.get("/super-admin/payments/transactions", { params });
  return res?.data?.data || res?.data;
};

/**
 * Super Admin Payment Transaction Detail
 * GET /api/v1/super-admin/payments/transactions/:id
 */
export const getAdminTransactionDetail = async (id) => {
  const res = await axiosClient.get(`/super-admin/payments/transactions/${id}`);
  return res?.data?.data || res?.data;
};

