import axiosClient from "./axiosClient";

/**
 * 1. Fetch all active public SaaS plans
 * GET /api/v1/plans
 */
export const getActivePlans = async () => {
  const res = await axiosClient.get("/plans");
  return res?.data?.data?.plans || res?.data?.plans || [];
};

/**
 * 2. Fetch current company subscription, effective quotas, and real-time usage
 * GET /api/v1/subscriptions/current
 */
export const getCurrentSubscription = async () => {
  const res = await axiosClient.get("/subscriptions/current");
  return res?.data?.data || res?.data;
};

/**
 * 3. Start Free 30-Day Demo Trial (Company Owner only, single-use per lifetime)
 * POST /api/v1/subscriptions/demo/start
 */
export const startDemoTrial = async () => {
  const res = await axiosClient.post("/subscriptions/demo/start");
  return res?.data?.data || res?.data;
};

/**
 * 4. Create Razorpay Payment Order for Subscription Purchase or Renewal
 * POST /api/v1/payments/order
 * Body: { planId, billingCycle: "MONTHLY" | "YEARLY" }
 */
export const createPaymentOrder = async ({ planId, billingCycle }) => {
  const res = await axiosClient.post("/payments/order", { planId, billingCycle });
  return res?.data?.data || res?.data;
};

/**
 * 5. Verify Razorpay Payment Signature and Activate Subscription
 * POST /api/v1/payments/verify
 * Body: { razorpayOrderId, razorpayPaymentId, razorpaySignature }
 */
export const verifyPayment = async (payload) => {
  const res = await axiosClient.post("/payments/verify", payload);
  return res?.data?.data || res?.data;
};

/**
 * 6. Get Company Payment Transaction History
 * GET /api/v1/payments/history
 */
export const getPaymentHistory = async () => {
  const res = await axiosClient.get("/payments/history");
  return res?.data?.data?.payments || res?.data?.payments || [];
};

/**
 * 7. Public Visitor Demo Onboarding: Create company & owner with 30-Day Free Trial
 * POST /api/v1/plans/register-demo
 */
export const registerDemoOnboarding = async (payload) => {
  const res = await axiosClient.post("/plans/register-demo", payload);
  return res?.data?.data || res?.data;
};

/**
 * 8. Public Visitor Paid Plan Onboarding: Create Razorpay Order
 * POST /api/v1/payments/onboarding-order
 */
export const createOnboardingOrder = async (payload) => {
  const res = await axiosClient.post("/payments/onboarding-order", payload);
  return res?.data?.data || res?.data;
};

/**
 * 9. Public Visitor Paid Plan Onboarding: Verify Payment & Activate Workspace
 * POST /api/v1/payments/onboarding-verify
 */
export const verifyOnboardingPayment = async (payload) => {
  const res = await axiosClient.post("/payments/onboarding-verify", payload);
  return res?.data?.data || res?.data;
};




/**
 * 10. Send Trial Application Email OTP
 * POST /api/v1/trial-applications/send-otp
 */
export const sendTrialOtp = async (email) => {
  const res = await axiosClient.post("/trial-applications/send-otp", { email });
  return res?.data?.data || res?.data;
};

/**
 * 11. Submit Demo Trial Application for Super Admin Approval
 * POST /api/v1/trial-applications/apply
 */
export const submitTrialApplication = async (payload) => {
  const res = await axiosClient.post("/trial-applications/apply", payload);
  return res?.data?.data || res?.data;
};
