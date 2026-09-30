import axiosClient from "./axiosClient";

/**
 * Public: Submit a new contact inquiry.
 * POST /api/v1/contact
 */
export const submitPublicContact = async (data) => {
  const res = await axiosClient.post("/contact", data);
  return res?.data || res;
};

/**
 * Super Admin: List all public contact inquiries.
 * GET /api/v1/super-admin/contact-inquiries
 */
export const getAdminContactInquiries = async (params = {}) => {
  const res = await axiosClient.get("/super-admin/contact-inquiries", { params });
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
 * Super Admin: Get a single public contact inquiry.
 * GET /api/v1/super-admin/contact-inquiries/:id
 */
export const getAdminContactInquiry = async (id) => {
  const res = await axiosClient.get(`/super-admin/contact-inquiries/${id}`);
  return res?.data?.inquiry || res?.data || res;
};

/**
 * Super Admin: Update a public contact inquiry's status.
 * PATCH /api/v1/super-admin/contact-inquiries/:id/status
 */
export const updateContactInquiryStatus = async (id, status) => {
  const res = await axiosClient.patch(`/super-admin/contact-inquiries/${id}/status`, { status });
  return res?.data || res;
};

/**
 * Super Admin: Reply to a public contact inquiry.
 * POST /api/v1/super-admin/contact-inquiries/:id/reply
 */
export const replyContactInquiry = async (id, reply) => {
  const res = await axiosClient.post(`/super-admin/contact-inquiries/${id}/reply`, { reply });
  return res?.data || res;
};
