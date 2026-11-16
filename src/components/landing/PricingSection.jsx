"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Sparkles,
  Users,
  Send,
  UserCheck,
  Zap,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Building2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getActivePlans } from "@/lib/api/plans";
import { useAuth } from "@/features/auth/context/AuthContext";

// Fallback plans if API is loading or network is slow
const DEFAULT_PLANS = [
  {
    id: "demo",
    code: "DEMO",
    name: "Demo Trial",
    description: "Experience the complete HireQuest recruitment suite for 7 days with zero commitment.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    seatLimit: 2,
    candidateLimit: 20,
    inviteLimit: 10,
    isTrial: true,
    isCustom: false,
    tag: "Free Trial",
  },
  {
    id: "starter",
    code: "STARTER",
    name: "Starter",
    description: "Ideal for boutique agencies and early-stage startups hiring their initial core team.",
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
    name: "Growth",
    description: "Designed for fast-scaling companies running active hiring rounds and talent pipelines.",
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
    name: "Business",
    description: "High-capacity hiring volume for established organizations and recruitment powerhouses.",
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
    name: "Enterprise",
    description: "Tailored quotas, dedicated proctoring models, and volume SLAs for enterprise teams.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    seatLimit: 50,
    candidateLimit: 50000,
    inviteLimit: 10000,
    isTrial: false,
    isCustom: true,
    tag: "Custom Scale",
  },
];

export default function PricingSection({ handleScrollTo }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [billingCycle, setBillingCycle] = useState("MONTHLY"); // "MONTHLY" | "YEARLY"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchPlans() {
      try {
        const fetched = await getActivePlans();
        if (isMounted && Array.isArray(fetched) && fetched.length > 0) {
          setPlans(fetched);
        }
      } catch (_) {
        // Fallback plans already initialized
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchPlans();
    return () => {
      isMounted = false;
    };
  }, []);

  const handlePlanAction = (e, plan) => {
    if (plan.isCustom || plan.code === "ENTERPRISE") {
      if (handleScrollTo) {
        handleScrollTo(e, "contact");
      } else {
        const el = document.getElementById("contact");
        el?.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    if (plan.isTrial || plan.code === "DEMO") {
      router.push("/register?plan=DEMO");
      return;
    }

    // If an existing company Owner is logged in, take them to their company billing page
    if (isAuthenticated && user?.role === "OWNER") {
      router.push("/company/plans");
      return;
    }

    // For public visitors: proceed to company registration with preserved plan & cycle
    router.push(`/register?plan=${encodeURIComponent(plan.code)}&billingCycle=${billingCycle}`);
  };

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-white/70 border-t border-blue-100/80 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <CreditCard className="h-3.5 w-3.5 text-blue-600" />
            <span>SaaS Plans & Dynamic Pricing</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Transparent, Predictable Hiring Plans
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            All plans include full platform access, 5 cognitive games, automated email parsing, and weighted scorecards.
            Only pay for the quotas your organization needs.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="pt-2 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200 shadow-inner">
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

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 items-stretch">
          {plans.map((plan) => {
            const isDemo = Boolean(plan.isTrial) || plan.code === "DEMO";
            const isEnterprise = Boolean(plan.isCustom) || plan.code === "ENTERPRISE";
            const isPopular = Boolean(plan.popular) || plan.code === "GROWTH";

            const price = billingCycle === "YEARLY" ? plan.yearlyPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-4 sm:p-4.5 flex flex-col justify-between transition-all duration-300 relative ${
                  isPopular
                    ? "bg-gradient-to-b from-blue-50/70 to-white border-2 border-blue-600 shadow-lg shadow-blue-500/10 scale-100 lg:-translate-y-1.5"
                    : "bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300"
                }`}
              >
                {/* Popular / Feature Pill */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md flex items-center gap-1 whitespace-nowrap">
                    <Sparkles className="h-2.5 w-2.5" />
                    <span>Most Popular</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h3 className="text-base font-extrabold text-slate-900 truncate">{plan.name}</h3>
                    {isDemo && (
                      <Badge className="bg-amber-100 text-amber-800 border-none text-[9px] font-bold px-1.5 py-0">
                        7-Day Trial
                      </Badge>
                    )}
                    {isEnterprise && (
                      <Badge className="bg-purple-100 text-purple-800 border-none text-[9px] font-bold px-1.5 py-0">
                        Tailored
                      </Badge>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 min-h-[28px] line-clamp-2 leading-tight mb-2.5">
                    {plan.description}
                  </p>

                  {/* Price Tag */}
                  <div className="mb-3 pb-3 border-b border-slate-100">
                    {isDemo ? (
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl sm:text-3xl font-black text-slate-900">₹0</span>
                          <span className="text-[11px] text-slate-500 font-medium">/ 7 days</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                          No credit card required
                        </span>
                      </div>
                    ) : isEnterprise ? (
                      <div>
                        <span className="text-2xl font-black text-slate-900">Custom</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">Tailored for large teams</span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl sm:text-3xl font-black text-slate-900">
                            ₹{Number(price).toLocaleString("en-IN")}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {billingCycle === "YEARLY" ? "/ yr" : "/ mo"}
                          </span>
                        </div>
                        {billingCycle === "YEARLY" && plan.monthlyPrice > 0 && (
                          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                            Billed annually (~₹{Math.round(price / 12)}/mo)
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Strict Quotas Display (Compact & Clean) */}
                  <div className="space-y-2 mb-4">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                      Enforced Limits
                    </span>

                    <div className="flex items-center gap-2 text-[11px] text-slate-700">
                      <UserCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      <span>
                        <strong>{plan.seatLimit !== null && plan.seatLimit !== undefined ? `${plan.seatLimit} Active` : "Tailored"}</strong> HR Seats{" "}
                        <span className="text-slate-400 text-[10px]">(Owner free)</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-700">
                      <Users className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
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
                      <span className="text-slate-600 font-medium truncate">
                        5 Cognitive Games included
                      </span>
                    </div>
                  </div>
                </div>

                {/* Call to Action Button */}
                <div className="pt-1">
                  <Button
                    onClick={(e) => handlePlanAction(e, plan)}
                    className={`w-full h-9 sm:h-9.5 text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition ${
                      isPopular
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
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
                        : isAuthenticated
                        ? "Buy / Upgrade Plan"
                        : "Get Started"}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Guarantees Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
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
              <h4 className="text-xs font-bold text-slate-900">Protected Snapshots</h4>
              <p className="text-[11px] text-slate-500">Plan changes never alter active subscriber terms.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Tenant Isolation</h4>
              <p className="text-[11px] text-slate-500">Dedicated subdomains & isolated candidate data.</p>
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
    </section>
  );
}

