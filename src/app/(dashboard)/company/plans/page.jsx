"use client";

import { useState, useEffect, useRef } from "react";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Users,
  Send,
  UserCheck,
  ShieldAlert,
  Loader2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Receipt,
  Zap,
  Calendar,
  Crown,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context";
import {
  getActivePlans,
  getCurrentSubscription,
  startDemoTrial,
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
} from "@/lib/api/plans";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Helper to load Razorpay checkout script on demand
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const formatSubscriptionDate = (dateString) => {
  if (!dateString) return "Not Available";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Not Available";

  const formatted = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  return formatted.replace(/([ap]m)$/i, (m) => m.toUpperCase());
};

export default function CompanyPlansPage() {
  const { user } = useAuth();
  const isOwner =
    user?.isOwner === true ||
    user?.role === "Company Owner" ||
    user?.role === "OWNER" ||
    user?.companyRole === "OWNER" ||
    user?.rawRole === "OWNER" ||
    user?.activeCompany?.role === "OWNER";

  const userRoleDisplay = isOwner ? "Company Owner" : user?.role || user?.companyRole || "Member";

  // Scroll & Parallax Refs (identical to Dashboard & Company settings)
  const scrollContainerRef = useRef(null);
  const farBgRef = useRef(null);
  const midHeroRef = useRef(null);

  const handleScroll = () => {
    const scrollY = scrollContainerRef.current?.scrollTop || 0;

    if (farBgRef.current) {
      const orbTranslate = scrollY * 0.58;
      const orbRotate = scrollY * 0.05;
      const orbScale = 1 + scrollY * 0.0003;
      farBgRef.current.style.transform = `translate3d(0, ${orbTranslate}px, 0) scale(${orbScale}) rotate(${orbRotate}deg)`;
    }

    if (midHeroRef.current) {
      const heroProgress = Math.min(scrollY / 450, 1);
      const heroTranslate = scrollY * 0.42;
      const heroOpacity = Math.max(1 - heroProgress * 0.75, 0.2);
      const heroScale = 1 - heroProgress * 0.06;
      midHeroRef.current.style.transform = `translate3d(0, ${heroTranslate}px, 0) scale(${heroScale})`;
      midHeroRef.current.style.opacity = heroOpacity;
    }
  };

  const companyName =
    user?.companyName ||
    user?.company?.name ||
    user?.company ||
    (typeof window !== "undefined" ? localStorage.getItem("companyName") : null) ||
    "Company";

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [history, setHistory] = useState([]);
  const [billingCycle, setBillingCycle] = useState("MONTHLY"); // "MONTHLY" | "YEARLY"
  const [processingPlanId, setProcessingPlanId] = useState(null);
  const [startingTrial, setStartingTrial] = useState(false);
  const [activeTab, setActiveTab] = useState("plans"); // "plans" | "history"

  const loadData = async () => {
    try {
      const [plansData, subData, histData] = await Promise.all([
        getActivePlans().catch(() => []),
        getCurrentSubscription().catch(() => null),
        getPaymentHistory().catch(() => []),
      ]);

      setPlans(Array.isArray(plansData) ? plansData : []);
      setSubscriptionData(subData);
      setHistory(Array.isArray(histData) ? histData : []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load subscription details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Free 7-Day Demo Trial activation
  const handleStartTrial = async () => {
    if (!isOwner) {
      toast.error("Only the Company Owner can start a free trial.");
      return;
    }
    setStartingTrial(true);
    try {
      await startDemoTrial();
      toast.success("🚀 7-Day Demo Trial started! Enjoy full platform capabilities.");
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to activate trial.");
    } finally {
      setStartingTrial(false);
    }
  };

  // Handle Paid Plan Purchase / Renewal via Official Razorpay Standard Checkout
  const handlePurchase = async (plan) => {
    if (!isOwner) {
      toast.error("Only the Company Owner has permission to purchase or renew subscriptions.");
      return;
    }

    setProcessingPlanId(plan.id);

    try {
      // 1. Ensure official Razorpay checkout script is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Failed to load Razorpay payment gateway. Please check your internet connection.");
        setProcessingPlanId(null);
        return;
      }

      // 2. Create order on backend (computes exact price server-side from DB)
      const orderRes = await createPaymentOrder({
        planId: plan.id,
        billingCycle,
      });

      const orderData = orderRes?.data || orderRes;
      const keyId = orderData?.keyId;
      const orderId = orderData?.orderId;
      const amount = orderData?.amount;
      const currency = orderData?.currency || "INR";

      if (!orderId || !keyId) {
        throw new Error("Invalid order response received from payment server.");
      }

      // 3. Launch Official Razorpay Standard Checkout
      const options = {
        key: keyId,
        amount,
        currency,
        name: "HireQuest Assessment Platform",
        description: `${plan.name} (${billingCycle}) Subscription Plan`,
        order_id: orderId,
        handler: async function (response) {
          try {
            toast.loading("Verifying payment security signature...", { id: "verify-toast" });

            await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            toast.success(`🎉 Subscription successfully activated for ${plan.name}!`, {
              id: "verify-toast",
            });
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("hirequest:plan-renewed", {
                  detail: { planName: plan.name },
                })
              );
            }
            await loadData();
            setActiveTab("plans");
          } catch (err) {
            toast.error(err?.response?.data?.message || "Payment verification failed.", {
              id: "verify-toast",
            });
          } finally {
            setProcessingPlanId(null);
          }
        },
        prefill: {
          name: user?.name || "Company Owner",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: {
          color: "#4f46e5",
        },
        modal: {
          ondismiss: function () {
            setProcessingPlanId(null);
            toast.info("Payment checkout cancelled.");
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", function (failResponse) {
        toast.error(`Payment failed: ${failResponse?.error?.description || "Transaction declined."}`);
        setProcessingPlanId(null);
      });

      razorpayInstance.open();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Could not initiate payment order.");
      setProcessingPlanId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 mt-3 font-medium">Loading subscription plans & quotas...</p>
      </div>
    );
  }

  const activeSub = subscriptionData?.activeSubscription || subscriptionData?.subscription;
  const currentPlanCode = activeSub?.planCode || subscriptionData?.plan || subscriptionData?.limits?.planCode || "STARTER";
  const currentPlanName = activeSub?.planName || subscriptionData?.planName || subscriptionData?.limits?.name || `${currentPlanCode} Plan`;
  const planStatus = activeSub?.status || subscriptionData?.planStatus || "ACTIVE";
  const isCurrentPlanExpired =
    planStatus === "EXPIRED" ||
    planStatus === "DEMO_EXPIRED" ||
    planStatus === "CANCELLED" ||
    subscriptionData?.company?.isPlanExpired ||
    false;

  const startDate = activeSub?.startDate || subscriptionData?.planStartedAt;
  const endDate = activeSub?.endDate || subscriptionData?.planExpiresAt;
  const billingCycleDisplay = activeSub?.billingCycle
    ? (activeSub.billingCycle === "YEARLY" ? "Yearly" : "Monthly")
    : null;
  const purchasedAmount = activeSub?.amount !== undefined && activeSub?.amount !== null
    ? Number(activeSub.amount)
    : null;

  // Actual quota limits from snapshot or current plan
  const seatLimit =
    activeSub?.seatLimit ??
    subscriptionData?.usage?.hrSeats?.limit ??
    subscriptionData?.effectiveLimits?.seatLimit ??
    subscriptionData?.limits?.hrSeats ??
    2;

  const candidateLimit =
    activeSub?.candidateLimit ??
    subscriptionData?.usage?.candidates?.limit ??
    subscriptionData?.effectiveLimits?.candidateLimit ??
    subscriptionData?.limits?.totalCandidates ??
    200;

  const inviteLimit =
    activeSub?.inviteLimit ??
    subscriptionData?.usage?.invitations?.limit ??
    subscriptionData?.effectiveLimits?.inviteLimit ??
    subscriptionData?.limits?.monthlyInvitations ??
    50;

  // Actual usage counts
  const seatsUsed =
    subscriptionData?.usage?.hrSeats?.used ??
    subscriptionData?.usage?.activeHrSeats ??
    0;

  const candidatesUsed =
    subscriptionData?.usage?.candidates?.used ??
    subscriptionData?.usage?.totalCandidates ??
    0;

  const invitesUsed =
    subscriptionData?.usage?.invitations?.used ??
    subscriptionData?.usage?.monthlyInvites ??
    0;

  const seatsPercent = seatLimit !== null ? Math.min(100, Math.round((seatsUsed / (seatLimit || 1)) * 100)) : 0;
  const candidatesPercent = candidateLimit !== null ? Math.min(100, Math.round((candidatesUsed / (candidateLimit || 1)) * 100)) : 0;
  const invitesPercent = inviteLimit !== null ? Math.min(100, Math.round((invitesUsed / (inviteLimit || 1)) * 100)) : 0;

  const hasUsedDemo = Boolean(subscriptionData?.hasUsedDemo || subscriptionData?.company?.hasUsedDemo);

  const isCandidateLimitExceeded = candidateLimit !== null && candidatesUsed > candidateLimit;
  const isSeatsLimitExceeded = seatLimit !== null && seatsUsed > seatLimit;
  const isInvitesLimitExceeded = inviteLimit !== null && invitesUsed > inviteLimit;

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="-m-4 md:-m-6 h-[calc(100dvh-64px)] max-h-[calc(100dvh-64px)] overflow-y-auto overflow-x-hidden relative bg-[#f8fafc] no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden font-sans"
    >
      {/* ── Layer 1 & 2: 3D Parallax Hero Header ── */}
      <div className="relative bg-gradient-to-r from-[#4E35E8] via-[#6D38F0] to-[#CF2E9F] text-white pt-10 pb-36 md:pb-40 px-6 md:px-12 overflow-hidden shadow-lg select-none">
        {/* Far Background: Rotating Ambient Orbs & Concentric Rings */}
        <div
          ref={farBgRef}
          className="absolute inset-0 pointer-events-none will-change-transform"
          style={{ transform: "translate3d(0, 0, 0)" }}
        >
          <div className="absolute -top-28 -right-28 w-[450px] h-[450px] rounded-full bg-white/12 blur-3xl" />
          <div className="absolute -top-16 -right-16 w-[380px] h-[380px] rounded-full border border-white/20" />
          <div className="absolute top-10 right-16 w-[260px] h-[260px] rounded-full border border-white/15" />
          <div className="absolute top-28 right-36 w-[140px] h-[140px] rounded-full border border-white/10" />

          {/* Floating Subtle Shimmer Sparks */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-white/40 blur-[1px] animate-pulse" />
          <div className="absolute top-1/3 left-2/3 w-2.5 h-2.5 rounded-full bg-pink-200/50 blur-[1px] animate-pulse" />
        </div>

        {/* Midground: Hero Content (0.42x Parallax Speed) */}
        <div
          ref={midHeroRef}
          className="max-w-7xl mx-auto space-y-4 relative z-10 will-change-transform"
          style={{ transform: "translate3d(0, 0, 0)" }}
        >
          <div className="space-y-1">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-white/75 drop-shadow-xs">
              {companyName}
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm">
              Plans & Pricing
            </h1>
            <p className="text-white/85 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl">
              Manage your company tier, view real-time quota usage, and purchase or renew subscriptions
            </p>
          </div>

          {/* Status banner in hero */}
          <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-2.5 px-4 flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 text-white shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-xl bg-white/20 border border-white/30 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <CreditCard className="h-4 w-4" />
              </div>
              <div className="text-xs min-w-0 flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white shrink-0">Current Subscription:</span>
                <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/40 text-[11px] py-0.5 px-2.5 flex items-center gap-1.5 font-semibold rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  {currentPlanName} • {isCurrentPlanExpired ? "EXPIRED" : planStatus}
                </Badge>
                <Badge className="bg-amber-400/20 text-amber-200 border-amber-300/40 text-[10px] font-semibold">
                  Razorpay Test Mode
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={loadData}
                disabled={loading}
                className="text-xs h-8 px-3 gap-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/30 font-semibold rounded-xl shadow-xs cursor-pointer transition-all"
                title="Refresh Subscription Data"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-white" : ""}`} />
                <span>{loading ? "Syncing..." : "Refresh Plans"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Layer 3: Main Foreground Content (-mt-20 to overlap hero) ── */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-12 -mt-20 md:-mt-24 pb-16 space-y-6">
        
        {/* Navigation Tabs Capsule (Identical to Company & Team page) */}
        <div className="rounded-2xl border border-white/90 bg-white/95 backdrop-blur-md p-1.5 shadow-[0_12px_30px_rgba(79,70,229,0.08),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar [scrollbar-width:none]">
          <button
            type="button"
            onClick={() => setActiveTab("plans")}
            className={`py-2 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "plans"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
            }`}
          >
            <CreditCard className="h-4 w-4" />
            Subscription & Plans
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`py-2 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "history"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
            }`}
          >
            <Receipt className="h-4 w-4" />
            Payment History ({history.length})
          </button>
        </div>

        {/* ── Your Current Subscription Section (Clean elevated white card) ── */}
        <div className="rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-6 sm:p-8 shadow-[0_12px_30px_rgba(79,70,229,0.08),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 space-y-6 relative overflow-hidden">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                  Your Current Subscription
                </span>
                <Badge
                  className={
                    isCurrentPlanExpired
                      ? "bg-rose-50 text-rose-700 border-rose-200 font-bold"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold"
                  }
                >
                  {isCurrentPlanExpired ? "EXPIRED" : planStatus}
                </Badge>
                {activeSub?.isTrial && (
                  <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-bold">
                    7-Day Demo Trial
                  </Badge>
                )}
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
                {currentPlanName}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {isCurrentPlanExpired
                  ? "Your subscription has expired. Please upgrade or renew below to restore full platform access."
                  : "Active subscription with guaranteed terms snapshot and strict quota bounds."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isOwner ? (
                <div className="text-xs text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200 font-semibold flex items-center gap-1.5 shadow-2xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Logged in as Company Owner
                </div>
              ) : (
                <div className="text-xs text-amber-800 bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200 font-medium">
                  Logged in as <strong>{userRoleDisplay}</strong> (Viewer) • Only Company Owner can purchase plans
                </div>
              )}
            </div>
          </div>

          {/* Subscription Key Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 text-xs">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Start Date
              </span>
              <span className="font-semibold text-slate-800 font-mono text-sm block">
                {formatSubscriptionDate(startDate)}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                End Date
              </span>
              <span className="font-semibold text-slate-800 font-mono text-sm block">
                {formatSubscriptionDate(endDate)}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Purchased Price
              </span>
              <span className="font-bold text-slate-900 text-sm block">
                {purchasedAmount !== null
                  ? purchasedAmount === 0
                    ? "Free"
                    : `₹${purchasedAmount.toLocaleString("en-IN")}${billingCycleDisplay ? ` / ${billingCycleDisplay.toLowerCase()}` : ""}`
                  : "Standard Tier"}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Billing Cycle
              </span>
              <span className="font-semibold text-slate-800 text-sm block capitalize">
                {billingCycleDisplay || (currentPlanCode === "DEMO" ? "7-Day Trial" : "Monthly")}
              </span>
            </div>
          </div>

          {/* ── 3 Enforced Quota Meters (Light Cards) ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. HR Seats */}
            <div className="bg-slate-50/80 hover:bg-slate-50 rounded-2xl p-5 border border-slate-200/70 transition-all">
              <div className="flex items-center justify-between text-xs text-slate-700 mb-2">
                <span className="flex items-center gap-1.5 font-bold">
                  <UserCheck className="h-4 w-4 text-indigo-600" />
                  Active HR Seats
                </span>
                <span className="font-extrabold text-slate-900 font-mono text-sm">
                  {seatsUsed} / {seatLimit !== null ? seatLimit : "∞"}
                </span>
              </div>
              <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden my-3">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#4E35E8] to-[#6D38F0] transition-all duration-500"
                  style={{ width: `${seatsPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
                <span>Admin + Recruiter members</span>
                <span className="text-emerald-600 font-semibold">Owner free</span>
              </div>
            </div>

            {/* 2. Candidate Limit */}
            <div className={`rounded-2xl p-5 border transition-all ${
              isCandidateLimitExceeded
                ? "bg-rose-50/40 hover:bg-rose-50/60 border-rose-200"
                : "bg-slate-50/80 hover:bg-slate-50 border-slate-200/70"
            }`}>
              <div className="flex items-center justify-between text-xs text-slate-700 mb-2">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Users className={`h-4 w-4 ${isCandidateLimitExceeded ? "text-rose-600" : "text-blue-600"}`} />
                    Lifetime Unique Candidates
                  </span>
                  {isCandidateLimitExceeded && (
                    <Badge className="bg-rose-100 text-rose-700 border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      Limit Exceeded
                    </Badge>
                  )}
                </div>
                <span className={`font-extrabold font-mono text-sm ${isCandidateLimitExceeded ? "text-rose-700" : "text-slate-900"}`}>
                  {candidatesUsed} / {candidateLimit !== null ? Number(candidateLimit).toLocaleString() : "∞"}
                </span>
              </div>
              <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden my-3">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isCandidateLimitExceeded
                      ? "bg-gradient-to-r from-rose-500 to-red-600"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600"
                  }`}
                  style={{ width: `${candidatesPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] font-medium">
                <span className={isCandidateLimitExceeded ? "text-rose-600 font-semibold" : "text-slate-500"}>
                  {isCandidateLimitExceeded ? "Upgrade required to add candidates" : "Total unique candidates"}
                </span>
                <span className={`font-semibold ${isCandidateLimitExceeded ? "text-rose-700 font-bold" : "text-slate-700"}`}>
                  {candidateLimit !== null ? `${Math.max(0, candidateLimit - candidatesUsed)} remaining` : "Unlimited"}
                </span>
              </div>
            </div>

            {/* 3. Monthly Invites */}
            <div className="bg-slate-50/80 hover:bg-slate-50 rounded-2xl p-5 border border-slate-200/70 transition-all">
              <div className="flex items-center justify-between text-xs text-slate-700 mb-2">
                <span className="flex items-center gap-1.5 font-bold">
                  <Send className="h-4 w-4 text-emerald-600" />
                  Monthly Assessment Invitations
                </span>
                <span className="font-extrabold text-slate-900 font-mono text-sm">
                  {invitesUsed} / {inviteLimit !== null ? Number(inviteLimit).toLocaleString() : "∞"}
                </span>
              </div>
              <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden my-3">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500"
                  style={{ width: `${invitesPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
                <span>Resets each calendar month</span>
                <span className="font-semibold text-slate-700">
                  {inviteLimit !== null ? `${Math.max(0, inviteLimit - invitesUsed)} left` : "Unlimited"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {activeTab === "plans" ? (
          <div className="space-y-6">
            {/* ── Billing Cycle Selector ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Available Subscription Plans</h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  All platform features are included in every tier. Choose the quotas that fit your recruitment pace.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs">
                <button
                  type="button"
                  onClick={() => setBillingCycle("MONTHLY")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    billingCycle === "MONTHLY"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("YEARLY")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    billingCycle === "YEARLY"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`}
                >
                  Yearly Billing
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                    Save ~17%
                  </span>
                </button>
              </div>
            </div>

            {/* ── Plans Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4.5">
              {plans.map((plan) => {
                const isCurrent = currentPlanCode === plan.code;
                const isDemo = Boolean(plan.isTrial) || plan.code === "DEMO";
                const isEnterprise = Boolean(plan.isCustom) || plan.code === "ENTERPRISE";

                const price = billingCycle === "YEARLY" ? plan.yearlyPrice : plan.monthlyPrice;
                const isProcessing = processingPlanId === plan.id;

                const isCandidateLimitExceeded = candidateLimit !== null && candidatesUsed > candidateLimit;
  const isSeatsLimitExceeded = seatLimit !== null && seatsUsed > seatLimit;
  const isInvitesLimitExceeded = inviteLimit !== null && invitesUsed > inviteLimit;

  return (
                  <div
                    key={plan.id}
                    className={`group rounded-2xl border bg-white/95 backdrop-blur-md p-4 sm:p-5 shadow-[0_8px_20px_rgba(79,70,229,0.06),0_2px_6px_rgba(0,0,0,0.02)] ring-1 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg ${
                      isCurrent
                        ? isCurrentPlanExpired
                          ? "border-rose-400 ring-rose-400/20 shadow-md relative bg-gradient-to-b from-rose-50/30 to-white"
                          : "border-indigo-500 ring-indigo-500/20 shadow-md relative bg-gradient-to-b from-indigo-50/30 to-white"
                        : "border-white/90 ring-slate-900/5 hover:border-slate-200"
                    }`}
                  >
                    {isCurrent && (
                      <div
                        className={`absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full shadow-md whitespace-nowrap ${
                          isCurrentPlanExpired ? "bg-rose-600" : "bg-gradient-to-r from-[#4E35E8] to-[#6D38F0]"
                        }`}
                      >
                        {isCurrentPlanExpired ? "Current Plan (Expired)" : "Current Plan"}
                      </div>
                    )}

                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <h3 className="text-base font-extrabold text-slate-900 truncate">{plan.name}</h3>
                        {isDemo && (
                          <Badge className="bg-amber-100 text-amber-800 border-none text-[9px] font-bold px-1.5 py-0">
                            Free Trial
                          </Badge>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 min-h-[28px] line-clamp-2 mb-2.5 leading-snug">
                        {plan.description || "Comprehensive talent screening & assessment access."}
                      </p>

                      {/* Price display */}
                      <div className="mb-3.5 pb-3.5 border-b border-slate-100">
                        {isDemo ? (
                          <div>
                            <span className="text-2xl sm:text-3xl font-black text-slate-900">₹0</span>
                            <span className="text-[11px] text-slate-500 ml-1 font-medium">/ 7 days</span>
                          </div>
                        ) : isEnterprise ? (
                          <div>
                            <span className="text-2xl font-black text-slate-900">Custom</span>
                            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Contact sales for bespoke limits</p>
                          </div>
                        ) : (
                          <div>
                            <span className="text-2xl sm:text-3xl font-black text-slate-900">
                              ₹{Number(price).toLocaleString("en-IN")}
                            </span>
                            <span className="text-[11px] text-slate-500 ml-1 font-medium">
                              {billingCycle === "YEARLY" ? "/ year" : "/ month"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Quota Limits (Strictly 3 limits only) */}
                      <div className="space-y-2 mb-4">
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                          Included Quotas
                        </span>

                        <div className="flex items-center gap-2 text-[11px] text-slate-700">
                          <UserCheck className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                          <span>
                            <strong>{plan.seatLimit !== null && plan.seatLimit !== undefined ? `${plan.seatLimit} Active` : "Tailored"}</strong> HR Seats <span className="text-slate-400 text-[10px]">(Owner free)</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-700">
                          <Users className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                          <span>
                            <strong>{plan.candidateLimit !== null && plan.candidateLimit !== undefined ? Number(plan.candidateLimit).toLocaleString() : "Tailored"}</strong> Lifetime Candidates
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-700">
                          <Send className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>
                            <strong>{plan.inviteLimit !== null && plan.inviteLimit !== undefined ? Number(plan.inviteLimit).toLocaleString() : "Custom"}</strong> Assessment Invites/mo
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-700 pt-0.5">
                          <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <span className="text-slate-500 text-[11px] truncate">All features & cognitive games</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-1">
                      {isDemo ? (
                        <Button
                          onClick={handleStartTrial}
                          disabled={hasUsedDemo || isCurrent || startingTrial || !isOwner}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl h-9 shadow-xs cursor-pointer transition-all"
                        >
                          {startingTrial ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : isCurrent ? (
                            "Current Plan"
                          ) : hasUsedDemo ? (
                            "Trial Already Used"
                          ) : !isOwner ? (
                            "Owner Only"
                          ) : (
                            "Start 7-Day Free Trial"
                          )}
                        </Button>
                      ) : isEnterprise ? (
                        <Button
                          variant="outline"
                          className="w-full text-xs font-bold rounded-xl h-9 border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs"
                          asChild
                        >
                          <a href="mailto:support@hirequest.com?subject=Enterprise%20Plan%20Inquiry">
                            Contact Sales
                          </a>
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handlePurchase(plan)}
                          disabled={isProcessing || !isOwner || (isCurrent && !isCurrentPlanExpired)}
                          className={`w-full text-xs font-bold rounded-xl h-9 transition-all ${
                            isCurrent
                              ? isCurrentPlanExpired
                                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20 cursor-pointer"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                              : "bg-gradient-to-r from-[#4E35E8] to-[#6D38F0] hover:from-[#432ec9] hover:to-[#5e2fd6] text-white shadow-md shadow-indigo-500/20 cursor-pointer"
                          }`}
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : !isOwner ? (
                            "Owner Only"
                          ) : isCurrent ? (
                            isCurrentPlanExpired ? "Renew Plan" : "Current Plan"
                          ) : isCurrentPlanExpired ? (
                            "Choose Plan"
                          ) : (
                            "Upgrade Plan"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ── Payment History Tab ── */
          <div className="rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-6 sm:p-8 shadow-[0_12px_30px_rgba(79,70,229,0.08),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 overflow-hidden">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Transaction & Billing History</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Verified payment transactions and invoice receipts</p>
              </div>
              <Badge variant="outline" className="text-xs border-slate-200 text-slate-600 font-semibold">
                Test Mode Records
              </Badge>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Receipt className="h-12 w-12 mx-auto mb-3 text-slate-300 stroke-[1.5]" />
                <p className="text-sm font-semibold text-slate-600">No payment transactions recorded yet.</p>
                <p className="text-xs text-slate-400 mt-1">Purchased subscriptions and renewals will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs uppercase font-bold text-slate-500">
                    <tr>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Plan</th>
                      <th className="py-3.5 px-4">Billing Cycle</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Order ID</th>
                      <th className="py-3.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.map((tx) => {
                      const displayAmount = Number(
                        tx.amount != null
                          ? tx.amount
                          : tx.amountPaise != null
                          ? tx.amountPaise / 100
                          : 0
                      ) || 0;
                      const planDisplayName =
                        tx.plan?.name ||
                        tx.planName ||
                        tx.planSnapshot?.name ||
                        "Standard Plan";

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-slate-800 text-xs">
                            {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {planDisplayName}
                          </td>
                          <td className="py-3.5 px-4 capitalize text-xs">{tx.billingCycle?.toLowerCase()}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            ₹{displayAmount.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                            {tx.razorpayOrderId}
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge
                              className={
                                tx.status === "COMPLETED"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold"
                                  : tx.status === "PENDING"
                                  ? "bg-amber-50 text-amber-700 border-amber-200 font-semibold"
                                  : "bg-rose-50 text-rose-700 border-rose-200 font-semibold"
                              }
                            >
                              {tx.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

