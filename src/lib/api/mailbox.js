import axiosClient from "./axiosClient";

/**
 * 1. Fetch Mailbox Connection Status
 * GET /api/v1/mailbox/status
 */
export const getMailboxStatus = async () => {
  try {
    const res = await axiosClient.get(`/mailbox/status?_t=${Date.now()}`, {
      headers: { "Cache-Control": "no-cache, no-store" },
    });
    return res?.data?.data || res?.data || res;
  } catch (error) {
    return {
      connected: false,
      email: null,
      isSyncActive: false,
      lastSyncedAt: null,
    };
  }
};

/**
 * 2. Get Google OAuth Connect URL
 * GET /api/v1/mailbox/google/connect
 */
export const getGoogleConnectUrl = async () => {
  const res = await axiosClient.get("/mailbox/google/connect");
  return res?.data?.data || res?.data || res;
};

/**
 * 3. Manual Sync Mailbox Now
 * POST /api/v1/mailbox/sync or POST /api/v1/mailbox/sync-now
 */
export const syncMailboxNow = async () => {
  const options = { timeout: 120000 }; // 2 minutes for heavy attachments
  const res = await axiosClient.post("/mailbox/sync", {}, options);
  return res?.data?.data || res?.data || res;
};

/**
 * 4. Disconnect Mailbox
 * POST /api/v1/mailbox/disconnect
 */
export const disconnectMailbox = async () => {
  const res = await axiosClient.post("/mailbox/disconnect");
  return res?.data?.data || res?.data || res;
};
