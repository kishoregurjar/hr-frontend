"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Lock,
  Mail,
  User,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Sparkles,
  UserCheck,
  Users,
  Send,
  Zap,
  Phone,
  Globe,
  Briefcase,
  AlertCircle,
  ExternalLink,
  Check,
  Clock,
  Info,
  Tag,
  Percent,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  getActivePlans,
  createOnboardingOrder,
  verifyOnboardingPayment,
  sendTrialOtp,
  submitTrialApplication,
  validateCouponCode,
} from "@/lib/api/plans";

// Load Razorpay checkout script on demand
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

export default function CompanyOnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialPlanCode = (searchParams.get("plan") || "DEMO").toUpperCase();
  const initialBillingCycle = (searchParams.get("billingCycle") || "MONTHLY").toUpperCase();
  const initialCouponCode = (searchParams.get("coupon") || searchParams.get("promo") || "").toUpperCase();

  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  const [selectedPlanCode, setSelectedPlanCode] = useState(initialPlanCode);
  const [billingCycle, setBillingCycle] = useState(initialBillingCycle);

  // Form State: Section 1 (Organization Details)
  const [companyName, setCompanyName] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [slugModified, setSlugModified] = useState(false);
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");

  // Form State: Section 2 (Owner Credentials)
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 6-Digit OTP State & Refs (for Demo Request)
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activationSuccess, setActivationSuccess] = useState(null);
  const [trialSubmitted, setTrialSubmitted] = useState(null);

  // Coupon / Promo Code State for Paid Plans
  const [couponCode, setCouponCode] = useState(initialCouponCode);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponRemoved, setCouponRemoved] = useState(false);

  // Automatically validate coupon carried from pricing page offers or manual entry
  const activePromoCode = !couponRemoved ? (appliedCoupon?.coupon?.code || couponCode || initialCouponCode) : "";

  useEffect(() => {
    if (activePromoCode && selectedPlanCode && selectedPlanCode !== "DEMO") {
      setValidatingCoupon(true);
      validateCouponCode({
        code: activePromoCode.trim().toUpperCase(),
        planCode: selectedPlanCode,
        billingCycle,
        isRenewal: false,
      })
        .then((res) => {
          if (res?.valid && res?.coupon) {
            setAppliedCoupon(res);
            setCouponError("");
            setCouponRemoved(false);
          } else {
            setCouponError(res?.message || "Invalid promo code.");
            setAppliedCoupon(null);
          }
        })
        .catch((err) => {
          const msg = err?.response?.data?.message || err?.message || "Invalid promo code.";
          setCouponError(msg);
          setAppliedCoupon(null);
        })
        .finally(() => {
          setValidatingCoupon(false);
        });
    }
  }, [activePromoCode, selectedPlanCode, billingCycle]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a promo code.");
      return;
    }
    setValidatingCoupon(true);
    setCouponError("");
    setCouponRemoved(false);
    try {
      const res = await validateCouponCode({
        code: couponCode.trim().toUpperCase(),
        planCode: selectedPlanCode,
        billingCycle,
        isRenewal: false,
      });

      if (res?.valid && res?.coupon) {
        setAppliedCoupon(res);
        setCouponError("");
        toast.success(`Promo code "${res.coupon.code}" applied! You save ₹${res.discountAmount}.`);
      } else {
        setCouponError(res?.message || "Invalid promo code.");
        setAppliedCoupon(null);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Invalid promo code.";
      setCouponError(msg);
      setAppliedCoupon(null);
      toast.error(msg);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponRemoved(true);
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  // Auto-generate slug from company name unless user explicitly edited it
  const autoSlug = companyName
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const activeSlug = slugModified ? customSlug : autoSlug;

  // Determine host domain for workspace preview
  const displayHost =
    typeof window !== "undefined" && window.location.hostname.includes("hirequest.com")
      ? "hirequest.com"
      : "localhost:3000";

  // OTP Cooldown Countdown Timer
  useEffect(() => {
    let timer;
    if (otpCooldown > 0) {
      timer = setInterval(() => {
        setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCooldown]);

  // Fetch active plans from backend
  useEffect(() => {
    let isMounted = true;
    async function fetchPlans() {
      try {
        const fetched = await getActivePlans();
        if (isMounted && Array.isArray(fetched) && fetched.length > 0) {
          setPlans(fetched);
        }
      } catch (_) {
        // Fallback handled below
      } finally {
        if (isMounted) setLoadingPlans(false);
      }
    }
    fetchPlans();
    return () => {
      isMounted = false;
    };
  }, []);

  const activePlan =
    plans.find((p) => p.code === selectedPlanCode) || {
      name: selectedPlanCode === "DEMO" ? "Demo Trial" : `${selectedPlanCode.charAt(0) + selectedPlanCode.slice(1).toLowerCase()} Plan`,
      code: selectedPlanCode,
      monthlyPrice: selectedPlanCode === "DEMO" ? 0 : selectedPlanCode === "GROWTH" ? 999 : selectedPlanCode === "BUSINESS" ? 2499 : 499,
      yearlyPrice: selectedPlanCode === "DEMO" ? 0 : selectedPlanCode === "GROWTH" ? 9990 : selectedPlanCode === "BUSINESS" ? 24990 : 4990,
      seatLimit: selectedPlanCode === "DEMO" ? null : selectedPlanCode === "GROWTH" ? 5 : selectedPlanCode === "BUSINESS" ? 15 : 2,
      candidateLimit: selectedPlanCode === "DEMO" ? null : selectedPlanCode === "GROWTH" ? 1000 : selectedPlanCode === "BUSINESS" ? 5000 : 200,
      inviteLimit: selectedPlanCode === "DEMO" ? null : selectedPlanCode === "GROWTH" ? 300 : selectedPlanCode === "BUSINESS" ? 1000 : 50,
      isTrial: selectedPlanCode === "DEMO",
    };

  const formatCurrency = (val) =>
    Number(val || 0).toLocaleString("en-IN", {
      minimumFractionDigits: Number(val) % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    });

  const isDemo = activePlan.isTrial || selectedPlanCode === "DEMO";
  const planPrice = billingCycle === "YEARLY" ? activePlan.yearlyPrice : activePlan.monthlyPrice;
  const basePrice = Number(planPrice) || 0;
  const discountAmount = appliedCoupon ? Number(appliedCoupon.discountAmount || 0) : 0;
  const finalPayable = appliedCoupon?.finalAmount !== undefined
    ? Number(appliedCoupon.finalAmount)
    : Math.max(0, basePrice - discountAmount);
  const otpCode = otpDigits.join("");
  const isOtpComplete = otpCode.length === 6;

  // Handle Work Email Changes (clears verification state if email changes)
  const handleEmailChange = (e) => {
    const val = e.target.value;
    setOwnerEmail(val);
    if (otpSent) {
      setOtpSent(false);
      setOtpDigits(["", "", "", "", "", ""]);
      setError(null);
    }
  };

  // Handle Workspace Slug Editing
  const handleSlugChange = (e) => {
    setSlugModified(true);
    const cleaned = e.target.value
      .toLowerCase()
      .replace(/[^\w-]/g, "")
      .replace(/[\s_]+/g, "-");
    setCustomSlug(cleaned);
  };

  // Handle Send / Resend OTP Action
  const handleSendOtp = async () => {
    if (!ownerEmail.trim()) {
      setError("Please enter your work email to receive the 6-digit verification code.");
      return;
    }
    const cleanEmail = ownerEmail.trim().toLowerCase();
    const domain = cleanEmail.split("@")[1] || "";
    const disposableList = [
      "mailinator.com",
      "tempmail.com",
      "10minutemail.com",
      "guerrillamail.com",
      "trashmail.com",
      "sharklasers.com",
      "getnada.com",
      "yopmail.com",
    ];
    if (disposableList.some((d) => domain.includes(d))) {
      setError("Temporary or disposable email addresses are not permitted. Please use a valid email.");
      return;
    }

    setOtpSending(true);
    setError(null);
    try {
      const res = await sendTrialOtp(cleanEmail);
      setOtpSent(true);
      setOtpCooldown(res?.cooldownSeconds || 60);
      toast.success(res?.message || "Verification code dispatched to your email!");
      // Auto-focus first OTP box
      setTimeout(() => {
        otpRefs[0].current?.focus();
      }, 150);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to dispatch verification code.";
      const code = err?.response?.data?.code;
      if (code === "OTP_RESEND_COOLDOWN") {
        const match = msg.match(/wait (\d+) seconds/i);
        if (match && match[1]) {
          setOtpCooldown(parseInt(match[1], 10));
        }
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setOtpSending(false);
    }
  };

  // 6-Digit OTP Box Handlers
  const handleOtpDigitChange = (index, value) => {
    const numeric = value.replace(/\D/g, "");
    const updated = [...otpDigits];

    if (!numeric) {
      updated[index] = "";
      setOtpDigits(updated);
      return;
    }

    // Take the last typed digit
    updated[index] = numeric[numeric.length - 1];
    setOtpDigits(updated);

    // Auto-advance to next box
    if (index < 5 && numeric.length > 0) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        otpRefs[index - 1].current?.focus();
        const updated = [...otpDigits];
        updated[index - 1] = "";
        setOtpDigits(updated);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpRefs[index - 1].current?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const updated = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      updated[i] = pasted[i] || "";
    }
    setOtpDigits(updated);

    const focusTarget = Math.min(pasted.length, 5);
    otpRefs[focusTarget].current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!companyName.trim()) {
      setError("Company / Organization name is required.");
      return;
    }
    if (!ownerName.trim()) {
      setError("Owner full name is required.");
      return;
    }
    if (!ownerEmail.trim()) {
      setError("Work email address is required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      companyName: companyName.trim(),
      ownerName: ownerName.trim(),
      ownerEmail: ownerEmail.trim().toLowerCase(),
      password,
      industry: industry.trim() || undefined,
      website: website.trim() || undefined,
      phone: phone.trim() || undefined,
      planCode: selectedPlanCode,
      billingCycle,
      couponCode: appliedCoupon ? appliedCoupon.coupon.code : undefined,
    };

    try {
      // ── Path 1: Instant Free 30-Day Demo Trial ──
      if (isDemo) {
        if (!isOtpComplete) {
          setError("Please enter the complete 6-digit email verification code.");
          setIsSubmitting(false);
          return;
        }

        const res = await submitTrialApplication({
          companyName: companyName.trim(),
          ownerName: ownerName.trim(),
          businessEmail: ownerEmail.trim().toLowerCase(),
          otp: otpCode.trim(),
          password,
          phone: phone.trim() || undefined,
          website: website.trim() || undefined,
          businessDescription: businessDescription.trim() || undefined,
          industry: industry.trim() || undefined,
        });

        toast.success("🎉 30-Day Free Trial activated! Workspace is live.");
        setActivationSuccess(res);

        if (res?.accessToken && typeof window !== "undefined") {
          localStorage.setItem("accessToken", res.accessToken);
          if (res.refreshToken) localStorage.setItem("refreshToken", res.refreshToken);
        }

        setTimeout(() => {
          if (res?.tenantUrl) {
            window.location.href = res.tenantUrl;
          } else {
            router.push("/dashboard");
          }
        }, 2000);

        setIsSubmitting(false);
        return;
      }

      // ── Path 2: Paid Subscription via Razorpay ──
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Failed to load Razorpay payment gateway. Please check your internet connection.");
      }

      // Step A: Create onboarding order on backend
      const orderRes = await createOnboardingOrder(payload);
      const orderData = orderRes?.data || orderRes;
      const keyId = orderData?.keyId;
      const orderId = orderData?.orderId;
      const amount = orderData?.amount;
      const currency = orderData?.currency || "INR";

      if (!orderId || !keyId) {
        throw new Error("Invalid order response received from payment server.");
      }

      // Step B: Open Official Razorpay Checkout
      const options = {
        key: keyId,
        amount,
        currency,
        name: "HireQuest Assessment Platform",
        description: appliedCoupon
          ? `${activePlan.name} (${billingCycle}) [${appliedCoupon.coupon.code} applied]`
          : `${activePlan.name} (${billingCycle}) Workspace Subscription`,
        order_id: orderId,
        handler: async function (paymentResponse) {
          try {
            toast.loading("Verifying payment and activating your company workspace...", {
              id: "verify-toast",
            });

            // Step C: Verify payment and activate workspace
            const verifyRes = await verifyOnboardingPayment({
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature,
            });

            toast.success("🎉 Payment verified! Company workspace is live.", { id: "verify-toast" });
            setActivationSuccess(verifyRes);

            if (verifyRes.accessToken && typeof window !== "undefined") {
              localStorage.setItem("accessToken", verifyRes.accessToken);
              if (verifyRes.refreshToken) localStorage.setItem("refreshToken", verifyRes.refreshToken);
            }

            setTimeout(() => {
              if (verifyRes.tenantUrl) {
                window.location.href = verifyRes.tenantUrl;
              } else {
                router.push("/dashboard");
              }
            }, 2500);
          } catch (verifyErr) {
            toast.error(verifyErr?.response?.data?.message || "Payment verification failed.", {
              id: "verify-toast",
            });
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: ownerName,
          email: ownerEmail,
          contact: phone || "",
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            toast.info("Payment cancelled. You can complete your registration anytime.");
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", function (failResponse) {
        toast.error(`Payment failed: ${failResponse?.error?.description || "Transaction declined."}`);
        setIsSubmitting(false);
      });

      razorpayInstance.open();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Registration failed. Please verify submitted details.";
      setError(msg);
      toast.error(msg);
      setIsSubmitting(false);
    }
  };

  // ── Pending Review Screen for Demo Applications ──
  if (trialSubmitted) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-5 py-10 px-6 rounded-2xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/40 animate-in fade-in zoom-in-95 duration-300 font-sans">
        <div className="relative inline-flex">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/25">
            <Clock className="h-8 w-8 text-white stroke-[2.5]" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
          </span>
        </div>

        <div className="space-y-1.5">
          <Badge className="bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[11px] uppercase px-2.5 py-0.5">
            Application Pending Review
          </Badge>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Trial Application Submitted!
          </h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Thank you, <strong className="text-slate-900 font-bold">{trialSubmitted.ownerName || ownerName}</strong>. Your Demo Trial application for <strong className="text-slate-900 font-bold">{trialSubmitted.companyName || companyName}</strong> has been received and queued for Super Admin review.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-left space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-slate-600 pb-2 border-b border-slate-200/60">
            <span className="font-semibold">Registered Email</span>
            <span className="font-mono font-bold text-slate-900">{trialSubmitted.businessEmail || ownerEmail}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600 pb-2 border-b border-slate-200/60">
            <span className="font-semibold">Evaluation Tier</span>
            <span className="inline-flex items-center gap-1 font-bold text-amber-700">
              <Sparkles className="h-3.5 w-3.5" />
              Demo Plan (30-Day Free Trial)
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-600 pb-2 border-b border-slate-200/60">
            <span className="font-semibold">Allocated Quotas</span>
            <span className="font-bold text-slate-800">2 Seats • 20 Candidates • 10 Invites</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-semibold">Trial Timer Status</span>
            <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
              Paused (Starts strictly upon Admin approval)
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-left text-xs text-blue-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-blue-950 text-xs">
            <Info className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            What happens next?
          </div>
          <p className="text-blue-800 leading-relaxed text-[11px]">
            Our Super Admin team will review your organization details. Once authorized, an approval email will be delivered to <strong>{trialSubmitted.businessEmail || ownerEmail}</strong> containing your company workspace URL and login instructions.
          </p>
        </div>

        <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Link href="/">
            <Button variant="outline" className="rounded-xl text-xs font-bold border-slate-200 h-9">
              Return to Home
            </Button>
          </Link>
          <Link href="/plans">
            <Button className="rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white h-9">
              Explore Paid Plans
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Success State Screen for Paid Activation ──
  if (activationSuccess) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-5 py-10 px-6 rounded-2xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/40 animate-in fade-in zoom-in-95 duration-300">
        <div className="relative inline-flex">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25">
            <CheckCircle2 className="h-8 w-8 text-white stroke-[2.5]" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
          </span>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Workspace Activated!
          </h2>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Welcome aboard, <strong className="text-slate-900 font-bold">{activationSuccess.user?.name || ownerName}</strong>. Your recruiter workspace has been successfully provisioned.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-left space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-slate-600 pb-2 border-b border-slate-200/60">
            <span className="font-semibold">Company Workspace</span>
            <span className="font-bold text-slate-900">{activationSuccess.company?.name || companyName}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600 pb-2 border-b border-slate-200/60">
            <span className="font-semibold">Subscription Plan</span>
            <span className="inline-flex items-center gap-1 font-bold text-indigo-600">
              <Sparkles className="h-3.5 w-3.5" />
              {selectedPlanCode} {isDemo ? "Trial" : `(${billingCycle})`}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-semibold">Workspace Access URL</span>
            <span className="font-mono text-[11px] font-bold text-blue-600 truncate max-w-[220px]">
              {activationSuccess.tenantUrl}
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-col items-center gap-2.5">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs text-blue-700 font-semibold">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
            <span>Redirecting to your workspace dashboard...</span>
          </div>

          <a
            href={activationSuccess.tenantUrl || "/dashboard"}
            className="text-xs font-semibold text-slate-500 hover:text-blue-600 underline transition"
          >
            Click here if you are not redirected automatically
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* ─────────────────────────────────────────────────────────────
          LEFT COLUMN (~33–35%): Compact Demo Plan Summary Card
      ───────────────────────────────────────────────────────────── */}
      <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-6">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
          {/* Header Row: Badge & Change Link */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                <Sparkles className="h-3 w-3 text-amber-600" />
                {activePlan.name}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                30-Day Trial
              </span>
            </div>

            <Link
              href="/plans"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition"
            >
              <span>Change</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          {/* Pricing Row */}
          <div className="pt-0.5">
            <div className="flex items-baseline justify-between gap-2">
              <div>
                {isDemo ? (
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900 tracking-tight">₹0</span>
                      <span className="text-[11px] font-extrabold text-amber-700 uppercase tracking-wide bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        30-Day Free Trial
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      No card required. Instant workspace access.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-slate-900 tracking-tight">
                        ₹{formatCurrency(appliedCoupon ? finalPayable : basePrice)}
                      </span>
                      {appliedCoupon && discountAmount > 0 && (
                        <span className="text-xs font-semibold text-slate-400 line-through">
                          ₹{formatCurrency(basePrice)}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-slate-500">
                        {billingCycle === "YEARLY" ? "/ year" : "/ month"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {billingCycle === "YEARLY" ? "Billed annually (2 months free)" : "Billed monthly. Cancel anytime."}
                    </p>
                  </div>
                )}
              </div>

              {/* Monthly / Yearly Switcher for Paid Plans */}
              {!isDemo && (
                <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setBillingCycle("MONTHLY")}
                    className={`px-2 py-0.5 rounded-md transition ${
                      billingCycle === "MONTHLY"
                        ? "bg-white text-blue-700 shadow-xs font-black"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle("YEARLY")}
                    className={`px-2 py-0.5 rounded-md transition ${
                      billingCycle === "YEARLY"
                        ? "bg-blue-600 text-white shadow-xs font-black"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Yearly
                  </button>
                </div>
              )}
            </div>

            {/* Promo Code Box for Paid Plans */}
            {!isDemo && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3 text-slate-400" />
                    Promo Code
                  </span>
                  {appliedCoupon && (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="ENTER CODE"
                    value={couponCode}
                    disabled={validatingCoupon || !!appliedCoupon}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError("");
                    }}
                    className="flex-1 px-2.5 py-1 text-xs font-mono uppercase bg-white border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon || !couponCode.trim() || !!appliedCoupon}
                    className="h-auto py-1 px-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {validatingCoupon ? <Loader2 className="h-3 w-3 animate-spin" /> : "Apply"}
                  </Button>
                </div>

                {couponError && (
                  <p className="text-[10px] text-rose-600 mt-1 font-medium">{couponError}</p>
                )}

                {appliedCoupon && (
                  <div className="mt-1.5 p-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] flex items-center justify-between">
                    <span>
                      <strong>{appliedCoupon.coupon.code}</strong> applied (-₹{formatCurrency(discountAmount)})
                    </span>
                    <span className="font-bold">Save ₹{formatCurrency(discountAmount)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Included Tier Entitlements */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Included Tier Entitlements
            </span>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <UserCheck className="h-3 w-3" />
                </div>
                <span className="text-[11px]">
                  <strong className="text-slate-900 font-bold">
                    {isDemo
                      ? "Unlimited"
                      : activePlan.seatLimit !== null && activePlan.seatLimit !== undefined
                      ? `${activePlan.seatLimit} Active`
                      : "Tailored"}{" "}
                    HR Seats
                  </strong>
                  <span className="text-slate-400 text-[10px] ml-1">(Owner free)</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Users className="h-3 w-3" />
                </div>
                <span className="text-[11px]">
                  <strong className="text-slate-900 font-bold">
                    {isDemo
                      ? "Unlimited"
                      : activePlan.candidateLimit !== null && activePlan.candidateLimit !== undefined
                      ? Number(activePlan.candidateLimit).toLocaleString()
                      : "Tailored"}
                  </strong>{" "}
                  Lifetime Candidates Pool
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Send className="h-3 w-3" />
                </div>
                <span className="text-[11px]">
                  <strong className="text-slate-900 font-bold">
                    {isDemo
                      ? "Unlimited"
                      : activePlan.inviteLimit !== null && activePlan.inviteLimit !== undefined
                      ? Number(activePlan.inviteLimit).toLocaleString()
                      : "Custom"}
                  </strong>{" "}
                  Assessment Invites / month
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Zap className="h-3 w-3" />
                </div>
                <span className="text-[11px]">5 Cognitive Mini-Games & Automated Scoring</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-3 w-3" />
                </div>
                <span className="text-[11px]">Anti-Cheat AI Proctoring & Fraud Detection</span>
              </div>
            </div>
          </div>

          {/* Infrastructure Guarantees */}
          <div className="pt-2.5 border-t border-slate-100 space-y-1.5 text-[10px] text-slate-500">
            <div className="flex items-center gap-1.5 font-medium">
              <Check className="h-3 w-3 text-emerald-600 shrink-0" />
              <span>Instant custom subdomain provisioning</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Check className="h-3 w-3 text-emerald-600 shrink-0" />
              <span>Strict multi-tenant schema-level data separation</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Check className="h-3 w-3 text-emerald-600 shrink-0" />
              <span>256-bit encrypted secure infrastructure</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          RIGHT COLUMN (~65–68%): Clean SaaS Registration Form Card
      ───────────────────────────────────────────────────────────── */}
      <div className="lg:col-span-8">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs">
          {/* Form Header */}
          <div className="space-y-1 mb-5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
                Workspace Registration
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] font-medium text-slate-500">Complete in 2 minutes</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Create Your Company Workspace
            </h1>
            <p className="text-xs text-slate-500">
              Tell us about your organization and set up your workspace owner account.
            </p>
          </div>

          {/* Form Element */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Alert */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {/* ── Section 1: Organization Details ── */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <div className="h-4 w-4 rounded-md bg-blue-600 text-white font-black text-[10px] flex items-center justify-center">
                  1
                </div>
                <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Organization Details
                </h2>
              </div>

              {/* Row 1: Company Name + Industry Sector (2 cols) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="companyName" className="text-[11px] font-bold text-slate-700">
                    Company / Organization Name <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="companyName"
                      placeholder="e.g. Acme Corporation"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="pl-9 h-10 text-xs sm:text-sm rounded-xl border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 transition"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="industry" className="text-[11px] font-bold text-slate-700">
                    Industry Sector
                  </Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="industry"
                      placeholder="e.g. Technology, Healthcare, Finance"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="pl-9 h-10 text-xs sm:text-sm rounded-xl border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Workspace Slug + Official Website (2 cols) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="slug" className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                    <span>Workspace Slug <span className="text-rose-500">*</span></span>
                    {activeSlug && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        Available
                      </span>
                    )}
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="slug"
                      placeholder="e.g. acme"
                      value={activeSlug}
                      onChange={handleSlugChange}
                      className="pl-9 h-10 text-xs sm:text-sm rounded-xl border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 transition font-mono"
                      required
                    />
                  </div>
                  {/* Neatly displayed live URL preview */}
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 pt-0.5 truncate">
                    <span className="text-slate-400">Workspace URL:</span>
                    <span className="truncate">
                      https://<strong className="text-blue-600 font-bold">{activeSlug || "your-company"}</strong>.{displayHost}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="website" className="text-[11px] font-bold text-slate-700">
                    Official Website <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="website"
                      placeholder="https://company.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="pl-9 h-10 text-xs sm:text-sm rounded-xl border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Phone Number + Business Overview (2 cols) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-[11px] font-bold text-slate-700">
                    Phone Number <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-9 h-10 text-xs sm:text-sm rounded-xl border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 transition"
                    />
                  </div>
                </div>

                {isDemo && (
                  <div className="space-y-1">
                    <Label htmlFor="businessDescription" className="text-[11px] font-bold text-slate-700">
                      Business Overview <span className="text-[10px] text-slate-400 font-normal">(Alternative to website)</span>
                    </Label>
                    <Input
                      id="businessDescription"
                      placeholder="e.g. 25-person team evaluating technical candidates"
                      value={businessDescription}
                      onChange={(e) => setBusinessDescription(e.target.value)}
                      className="h-10 text-xs sm:text-sm rounded-xl border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 transition"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ── Section 2: Owner Credentials ── */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <div className="h-4 w-4 rounded-md bg-blue-600 text-white font-black text-[10px] flex items-center justify-center">
                  2
                </div>
                <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Owner Credentials
                </h2>
              </div>

              {/* Row 4: Owner Full Name + Work Email (2 cols) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="ownerName" className="text-[11px] font-bold text-slate-700">
                    Owner Full Name <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="ownerName"
                      placeholder="e.g. John Doe"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="pl-9 h-10 text-xs sm:text-sm rounded-xl border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 transition"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="ownerEmail" className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                    <span>Work Email Address <span className="text-rose-500">*</span></span>
                  </Label>
                  <div className="flex gap-1.5">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="ownerEmail"
                        type="email"
                        placeholder="owner@company.com"
                        value={ownerEmail}
                        onChange={handleEmailChange}
                        className="pl-9 h-10 text-xs sm:text-sm rounded-xl border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 transition"
                        required
                      />
                    </div>
                    {isDemo && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSendOtp}
                        disabled={otpSending || otpCooldown > 0 || !ownerEmail.includes("@")}
                        className="h-10 px-3 text-xs font-bold rounded-xl border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 shrink-0 cursor-pointer"
                      >
                        {otpSending ? (
                          <div className="flex items-center gap-1.5">
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-700" />
                            <span>Sending...</span>
                          </div>
                        ) : otpCooldown > 0 ? (
                          `Resend (${otpCooldown}s)`
                        ) : otpSent ? (
                          "Resend Code"
                        ) : (
                          "Verify Email"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 5 (Demo Only): Redesigned 6-Digit OTP Verification Component */}
              {isDemo && (
                <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <Label htmlFor="otp-0" className="font-bold text-amber-950 flex items-center gap-1.5 text-[11px]">
                      <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                      <span>Email Verification Code (6-Digit OTP) <span className="text-rose-500">*</span></span>
                    </Label>
                    {otpSent ? (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md">
                        Code sent to {ownerEmail}
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-700 font-medium">
                        Click &apos;Verify Email&apos; to receive your code
                      </span>
                    )}
                  </div>

                  {/* Six Compact Digit Boxes */}
                  <div className="flex items-center justify-center gap-2 sm:gap-3 py-1">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-${idx}`}
                        ref={otpRefs[idx]}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={handleOtpPaste}
                        className={`w-10 sm:w-11 h-11 text-center font-mono font-bold text-lg rounded-xl border bg-white transition outline-none shadow-xs ${
                          digit
                            ? "border-amber-500 ring-2 ring-amber-500/20 text-slate-900"
                            : "border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-700"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Status & Resend Helper Row */}
                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    <div>
                      {isOtpComplete ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          6-digit verification code ready
                        </span>
                      ) : (
                        <span className="text-slate-500">
                          Enter the 6-digit code sent to your work email.
                        </span>
                      )}
                    </div>

                    <div>
                      {otpCooldown > 0 ? (
                        <span className="text-slate-400 font-medium">
                          Resend in <strong className="text-slate-700 font-mono">{otpCooldown}s</strong>
                        </span>
                      ) : otpSent ? (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-amber-800 hover:text-amber-900 font-bold underline cursor-pointer"
                        >
                          Resend Code
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}

              {/* Row 6: Password + Confirm Password (2 cols) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="password" className="text-[11px] font-bold text-slate-700">
                    Password <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-9 h-10 text-xs sm:text-sm rounded-xl border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">Min. 6 alphanumeric characters</p>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="confirmPassword" className="text-[11px] font-bold text-slate-700">
                    Confirm Password <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-9 pr-9 h-10 text-xs sm:text-sm rounded-xl border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="h-3 w-3" /> Passwords match
                    </p>
                  )}
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-[10px] text-rose-500 font-semibold">Passwords do not match</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Submit Action CTA Button ── */}
            <div className="pt-3 space-y-2">
              {/* Promotional Discount Savings Banner above primary CTA */}
              {!isDemo && appliedCoupon && discountAmount > 0 && (
                <div className="p-2.5 rounded-xl bg-emerald-50/90 border border-emerald-200 text-xs flex items-center justify-between text-emerald-950 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Percent className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">
                          Coupon {appliedCoupon.coupon?.code} Applied
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold border border-emerald-300">
                          -₹{formatCurrency(discountAmount)} OFF
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-700 block">
                        Final payment calculated with discount applied.
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 line-through mr-1.5 block sm:inline">
                      ₹{formatCurrency(basePrice)}
                    </span>
                    <span className="font-black text-sm text-emerald-700">
                      ₹{formatCurrency(finalPayable)}
                    </span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || (isDemo && !isOtpComplete)}
                className={`w-full h-11 text-white font-black text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition transform active:scale-[0.99] ${
                  isDemo
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/20"
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{isDemo ? "Activating 30-Day Free Workspace..." : "Provisioning Workspace..."}</span>
                  </div>
                ) : isDemo ? (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Start 30-Day Free Trial</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span className="flex items-center gap-1.5">
                      <span>Proceed to Razorpay Checkout</span>
                      <span className="font-mono font-bold">(₹{formatCurrency(finalPayable)})</span>
                      {appliedCoupon && discountAmount > 0 && (
                        <span className="line-through text-blue-200 text-xs font-normal">
                          ₹{formatCurrency(basePrice)}
                        </span>
                      )}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>

              {/* Supporting text directly below button */}
              <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                {isDemo
                  ? "Instant access to all features for 30 days. No credit card required."
                  : "Your isolated recruiter workspace is provisioned immediately upon verified payment."}
              </p>

              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-1">
                <span>By continuing, you agree to HireQuest terms.</span>
                <span className="font-semibold text-slate-500 flex items-center gap-1">
                  <Lock className="h-3 w-3 text-emerald-600" /> 256-bit SSL Encryption
                </span>
              </div>
            </div>

            {/* Bottom Link to Workspace Sign In */}
            <div className="text-center pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Already registered your company?{" "}
                <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
                  Sign in to workspace
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
