import axiosClient from "./axiosClient";

/**
 * HR: Submit a new support request.
 * POST /api/v1/support
 */
export const submitSupportRequest = async ({ subject, message }) => {
  const res = await axiosClient.post("/support", { subject, message });
  return res?.data || res;
};

/**
 * HR: List own support requests.
 * GET /api/v1/support/my-requests
 */
export const getMyRequests = async (params = {}) => {
  const res = await axiosClient.get("/support/my-requests", { params });
  const data = res?.data || res;
  return {
    items: data?.items || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 20,
    totalPages: data?.totalPages || 1,
  };
};

/**
 * HR: Get a single support request.
 * GET /api/v1/support/:requestId
 */
export const getSupportRequest = async (requestId) => {
  const res = await axiosClient.get(`/support/${requestId}`);
  return res?.data?.request || res?.data || res;
};

/**
 * Super Admin: List all support requests.
 * GET /api/v1/super-admin/support
 */
export const getAdminSupportRequests = async (params = {}) => {
  const res = await axiosClient.get("/super-admin/support", { params });
  const data = res?.data || res;
  return {
    items: data?.items || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 20,
    totalPages: data?.totalPages || 1,
  };
};

/**
 * Super Admin: Get a single support request.
 * GET /api/v1/super-admin/support/:requestId
 */
export const getAdminSupportRequest = async (requestId) => {
  const res = await axiosClient.get(`/super-admin/support/${requestId}`);
  return res?.data?.request || res?.data || res;
};

/**
 * Super Admin: Update a support request's status.
 * PATCH /api/v1/super-admin/support/:requestId/status
 */
export const updateSupportStatus = async (requestId, status) => {
  const res = await axiosClient.patch(`/super-admin/support/${requestId}/status`, { status });
  return res?.data || res;
};

/**
 * Super Admin: Reply to a support request.
 * POST /api/v1/super-admin/support/:requestId/reply
 */
export const replySupportRequest = async (requestId, reply) => {
  const res = await axiosClient.post(`/super-admin/support/${requestId}/reply`, { reply });
  return res?.data || res;
};
