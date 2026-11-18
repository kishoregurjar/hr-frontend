"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  Users,
  Send,
  UserCheck,
  Zap,
  ArrowRight,
  ShieldCheck,
  Building2,
  Lock,
  Loader2,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LandingHeader, LandingFooter } from "@/components/landing";
import { getActivePlans } from "@/lib/api/plans";
import { useAuth } from "@/features/auth/context/AuthContext";

// Fallback plans if API is loading or network is slow
const DEFAULT_PLANS = [
  {
    id: "demo",
    code: "DEMO",
    name: "Demo Plan",
    description: "30-day free trial with standard feature access for evaluation.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    seatLimit: 2,
    candidateLimit: 20,
    inviteLimit: 10,
    durationDays: 30,
    isTrial: true,
    isCustom: false,
    tag: "Free Trial",
  },
  {
    id: "starter",
    code: "STARTER",
    name: "Starter Plan",
    description: "Essential workspace capacity for growing recruitment teams.",
    monthlyPrice: 499,
    yearlyPrice: 4990,
    seatLimit: 2,
    candidateLimit: 200,
    inviteLimit: 50,
    isTrial: false,
    isCustom: false,
  },
  {
    id: "growth",
    code: "GROWTH",
    name: "Growth Plan",
    description: "Comprehensive recruitment engine for expanding talent teams.",
    monthlyPrice: 999,
    yearlyPrice: 9990,
    seatLimit: 5,
    candidateLimit: 1000,
    inviteLimit: 300,
    isTrial: false,
    isCustom: false,
    popular: true,
    tag: "Most Popular",
  },
  {
    id: "business",
    code: "BUSINESS",
    name: "Business Plan",
    description: "High-volume recruitment power with generous quota limits.",
    monthlyPrice: 2499,
    yearlyPrice: 24990,
    seatLimit: 15,
    candidateLimit: 5000,
    inviteLimit: 1000,
    isTrial: false,
    isCustom: false,
  },
  {
    id: "enterprise",
    code: "ENTERPRISE",
    name: "Enterprise Plan",
    description: "Custom limits and dedicated platform capacity tailored to large teams.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    seatLimit: null,
    candidateLimit: null,
    inviteLimit: null,
    isTrial: false,
    isCustom: true,
    tag: "Custom Scale",
  },
];

export default function PublicPlansPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const isOwner = user?.role === "OWNER";

  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState("MONTHLY"); // "MONTHLY" | "YEARLY"
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isTenantDomain, setIsTenantDomain] = useState(false);

  // Client-side defense-in-depth: If opened on customer tenant domain, redirect to private workspace subscription page
  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname.toLowerCase();
      const configuredRoot = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "hirequest.com").toLowerCase();
      const isPlatformRoot =
        [
          "localhost",
          "127.0.0.1",
          "hirequest.com",
          "www.hirequest.com",
          "app.hirequest.com",
          "admin.hirequest.com",
          configuredRoot,
          `www.${configuredRoot}`,
          `app.${configuredRoot}`,
          `admin.${configuredRoot}`,
        ].includes(host) || host.endsWith(".vercel.app");

      if (!isPlatformRoot && !host.startsWith("admin.") && !host.startsWith("app.")) {
        setIsTenantDomain(true);
        router.replace("/company/plans");
      }
    }
  }, [router]);

  useEffect(() => {
    let isMounted = true;
    async function loadPlans() {
      try {
        const fetched = await getActivePlans();
        if (isMounted && Array.isArray(fetched) && fetched.length > 0) {
          setPlans(fetched);
        }
      } catch (err) {
        console.error("Failed to fetch public SaaS plans:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadPlans();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleScrollTo = (e, id) => {
    e.preventDefault();
    router.push(`/#${id}`);
  };

  const handlePlanSelect = (plan) => {
    if (plan.isCustom || plan.code === "ENTERPRISE") {
      router.push("/#contact");
      return;
    }

    if (plan.isTrial || plan.code === "DEMO") {
      router.push("/register?plan=DEMO");
      return;
    }

    router.push(`/register?plan=${encodeURIComponent(plan.code)}&billingCycle=${billingCycle}`);
  };

  if (isTenantDomain) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-[#e8f2fe] text-slate-800 overflow-x-hidden font-sans">
      {/* Decorative background blobs */}
      <div className="absolute top-20 left-10 w-48 h-48 bg-[#d0e5fc] rounded-full filter blur-xl opacity-70 -z-10 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-[#d8ebff] rounded-full filter blur-2xl opacity-60 -z-10" />

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-3 sm:py-4 md:px-8">
        <LandingHeader
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          handleScrollTo={handleScrollTo}
        />

        {/* Existing Company Owner Banner */}
        {isAuthenticated && isOwner && (
          <div className="mt-4 p-4 rounded-2xl bg-blue-600 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 shrink-0 text-blue-200" />
              <p className="text-xs sm:text-sm font-medium">
                You are logged in as a <strong>Company Owner</strong>. Looking to upgrade or renew your existing workspace?
              </p>
            </div>
            <Link href="/company/plans">
              <Button size="sm" variant="secondary" className="text-xs font-bold gap-1.5 shrink-0">
                Go to Workspace Billing
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        )}

        {/* Header Section */}
        <div className="py-12 sm:py-16 text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <CreditCard className="h-3.5 w-3.5 text-blue-600" />
            <span>HireQuest SaaS Pricing</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Predictable Plans for Modern Hiring
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Every plan includes full access to candidate screening, 5 cognitive games, email parsing, and proctoring logs.
            Choose the quotas that fit your hiring pace.
          </p>

          {/* Billing Switcher */}
          <div className="pt-4 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300 shadow-inner">
              <button
                type="button"
                onClick={() => setBillingCycle("MONTHLY")}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  billingCycle === "MONTHLY"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("YEARLY")}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  billingCycle === "YEARLY"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Yearly Billing</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  Save ~17%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Plans Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            <p className="text-sm text-slate-500 mt-3 font-medium">Loading subscription tiers...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 sm:gap-6 items-stretch mb-16">
            {plans.map((plan) => {
              const isDemo = Boolean(plan.isTrial) || plan.code === "DEMO";
              const isEnterprise = Boolean(plan.isCustom) || plan.code === "ENTERPRISE";
              const isPopular = Boolean(plan.popular) || plan.code === "GROWTH";

              const price = billingCycle === "YEARLY" ? plan.yearlyPrice : plan.monthlyPrice;

              return (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 relative ${
                    isPopular
                      ? "bg-gradient-to-b from-blue-50/90 to-white border-2 border-blue-600 shadow-xl shadow-blue-500/10 scale-100 lg:-translate-y-2"
                      : "bg-white border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-slate-300"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      <span>Most Popular</span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                      {isDemo && (
                        <Badge className="bg-amber-100 text-amber-800 border-none text-[10px] font-bold">
                          {plan.durationDays ? `${plan.durationDays}-Day Trial` : "30-Day Trial"}
                        </Badge>
                      )}
                      {isEnterprise && (
                        <Badge className="bg-purple-100 text-purple-800 border-none text-[10px] font-bold">
                          Tailored
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 min-h-[36px] line-clamp-2 leading-relaxed mb-5">
                      {plan.description || "Unified hiring pipeline & candidate screening platform."}
                    </p>

                    {/* Price Tag */}
                    <div className="mb-6 pb-6 border-b border-slate-100">
                      {isDemo ? (
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">₹0</span>
                            <span className="text-xs text-slate-500 font-medium">/ {plan.durationDays ? `${plan.durationDays} days` : "30 days"}</span>
                          </div>
                          <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
                            No credit card required
                          </span>
                        </div>
                      ) : isEnterprise ? (
                        <div>
                          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">Custom</span>
                          <span className="text-xs text-slate-500 block mt-1">Tailored for large organizations</span>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                              ₹{Number(price).toLocaleString("en-IN")}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              {billingCycle === "YEARLY" ? "/ yr" : "/ mo"}
                            </span>
                          </div>
                          {billingCycle === "YEARLY" && plan.monthlyPrice > 0 && (
                            <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
                              Billed annually (~₹{Math.round(price / 12)}/mo)
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Strict 3 Quotas Display */}
                    <div className="space-y-3.5 mb-6">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                        Included Quotas
                      </span>

                      <div className="flex items-start gap-2.5 text-xs text-slate-700">
                        <UserCheck className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>{plan.seatLimit !== null && plan.seatLimit !== undefined ? `${plan.seatLimit} Active` : "Tailored"}</strong> HR Seats
                          <span className="text-slate-400 block text-[11px] font-medium">
                            (Owner seat is always free)
                          </span>
                        </span>
                      </div>

                      <div className="flex items-start gap-2.5 text-xs text-slate-700">
                        <Users className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>{plan.candidateLimit !== null && plan.candidateLimit !== undefined ? Number(plan.candidateLimit).toLocaleString() : "Tailored"}</strong> Lifetime Candidates
                          <span className="text-slate-400 block text-[11px]">in unified talent pool</span>
                        </span>
                      </div>

                      <div className="flex items-start gap-2.5 text-xs text-slate-700">
                        <Send className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>{plan.inviteLimit !== null && plan.inviteLimit !== undefined ? Number(plan.inviteLimit).toLocaleString() : "Custom"}</strong> Assessment Invites
                          <span className="text-slate-400 block text-[11px]">dispatched per month</span>
                        </span>
                      </div>

                      <div className="flex items-start gap-2.5 text-xs text-slate-700 pt-1">
                        <Zap className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <span className="text-slate-600 font-medium">
                          All 5 cognitive games & full feature access
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Call to Action Button */}
                  <div className="pt-2">
                    <Button
                      onClick={() => handlePlanSelect(plan)}
                      className={`w-full h-11 text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 transition ${
                        isPopular
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25"
                          : isDemo
                          ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
                          : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10"
                      }`}
                    >
                      <span>
                        {isEnterprise
                          ? "Contact Sales"
                          : isDemo
                          ? "Request Free Trial"
                          : "Purchase Plan"}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Value Proposition Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Owner Seat Free</h4>
              <p className="text-[11px] text-slate-500">Company owner consumes 0 HR seats.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Terms Protection</h4>
              <p className="text-[11px] text-slate-500">Snapshots protect your purchased rate.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Tenant Isolation</h4>
              <p className="text-[11px] text-slate-500">Company-specific URLs & isolated talent data.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Razorpay Secured</h4>
              <p className="text-[11px] text-slate-500">Instant test & live mode subscription activation.</p>
            </div>
          </div>
        </div>
      </div>

      <LandingFooter handleScrollTo={handleScrollTo} />
    </div>
  );
}

