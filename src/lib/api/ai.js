import axiosClient from "./axiosClient";

/**
 * Send message to HR AI Copilot
 * @param {Object} params
 * @param {string} params.message
 * @param {Array} params.history
 * @returns {Promise<Object>}
 */
export const sendHRCopilotMessage = async ({ message, history = [] }) => {
  const res = await axiosClient.post("/ai/chat", { message, history });
  return res?.data?.data || res?.data || res;
};

/**
 * Get AI Copilot status and provider details
 * @returns {Promise<Object>}
 */
export const getAICopilotStatus = async () => {
  const res = await axiosClient.get("/ai/status");
  return res?.data?.data || res?.data || res;
};

