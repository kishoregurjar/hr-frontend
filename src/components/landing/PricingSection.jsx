"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles,
  Users,
  Send,
  UserCheck,
  Zap,
  ArrowRight,
  ShieldCheck,
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
    name: "Demo Plan",
    description: "7-day free trial with standard feature access for evaluation.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    seatLimit: 1,
    candidateLimit: 5,
    inviteLimit: 5,
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
    description: "Custom limits and dedicated platform capacity tailored to your enterprise.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    seatLimit: 50,
    candidateLimit: 50000,
    inviteLimit: 10000,
    isTrial: false,
    isCustom: true,
    tag: "Tailored",
  },
];

/**
 * Compact 3D Parallax Tilt & Dynamic Spotlight Card
 */
function PricingTiltCard({ children, isPopular = false, className = "", ...props }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;

    const normX = x / w - 0.5;
    const normY = y / h - 0.5;

    const rotateY = normX * 6; // Calm 6deg max tilt
    const rotateX = -normY * 6;

    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
    const liftY = isPopular ? -8 : -4;
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${liftY}px)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;

    const baseLift = isPopular ? -4 : 0;
    card.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg) translateY(${baseLift}px)`;
    card.style.setProperty("--mouse-x", "50%");
    card.style.setProperty("--mouse-y", "50%");
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        transform: isPopular ? "translateY(-4px)" : "translateY(0px)",
      }}
      className={`group relative rounded-2xl flex flex-col justify-between transition-all duration-300 ease-out select-none ${
        isPopular
          ? "bg-gradient-to-b from-blue-50/70 to-white border-2 border-blue-600 shadow-lg shadow-blue-500/10 z-20"
          : "bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 z-10"
      } ${className}`}
      {...props}
    >
      {/* Dynamic Cursor Spotlight Radial Glow */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"
        style={{
          background: isPopular
            ? "radial-gradient(circle 260px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(37, 99, 235, 0.14) 0%, transparent 75%)"
            : "radial-gradient(circle 240px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(37, 99, 235, 0.10) 0%, transparent 75%)",
        }}
      />

      {/* Content wrapper with exact compact padding */}
      <div className="relative z-10 flex flex-col justify-between h-full p-4 sm:p-4.5">
        {children}
      </div>
    </div>
  );
}

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
    <section id="pricing" className="py-16 sm:py-24 relative overflow-hidden bg-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 space-y-12 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Transparent, Predictable Hiring Plans
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            All plans include full platform access, 5 cognitive games, automated email parsing, and weighted scorecards.
            Only pay for the quotas your organization needs.
          </p>

          {/* Luxury Floating Billing Cycle Switcher */}
          <div className="pt-2 flex items-center justify-center">
            <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-slate-100/90 border border-slate-200/80 shadow-inner backdrop-blur-md">
              <button
                type="button"
                onClick={() => setBillingCycle("MONTHLY")}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
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
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  billingCycle === "YEARLY"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Yearly Billing</span>
                <span className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/25 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs">
                  Save ~17%
                </span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Pricing Cards Grid (5-Tiers with Left-to-Right Domino Cascade Animation) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 items-stretch pt-2">
          {plans.map((plan, index) => {
            const isDemo = Boolean(plan.isTrial) || plan.code === "DEMO";
            const isEnterprise = Boolean(plan.isCustom) || plan.code === "ENTERPRISE";
            const isPopular = Boolean(plan.popular) || plan.code === "GROWTH";

            const price = billingCycle === "YEARLY" ? plan.yearlyPrice : plan.monthlyPrice;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, x: -35 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="h-full flex flex-col"
              >
                <PricingTiltCard isPopular={isPopular}>
                  {/* Popular Pill Badge */}
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md flex items-center gap-1 whitespace-nowrap">
                      <Sparkles className="h-2.5 w-2.5" />
                      <span>Most Popular</span>
                    </div>
                  )}

                  <div>
                    {/* Plan Title & Micro Badges */}
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
                          {billingCycle === "YEARLY" && plan.monthlyPrice > 0 ? (
                            <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                              Billed annually (~₹{Math.round(price / 12)}/mo)
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Flexible monthly billing
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Exact Compact Quotas Display Matching User Screenshot */}
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

                  {/* Call to Action Button with Hover Shimmer Sweep */}
                  <div className="pt-1">
                    <Button
                      onClick={(e) => handlePlanAction(e, plan)}
                      className={`group/btn relative overflow-hidden w-full h-9 sm:h-9.5 text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all duration-300 ${
                        isPopular
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                          : isDemo
                          ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
                          : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10"
                      }`}
                    >
                      {/* Shimmer Light Sweep on Hover */}
                      <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                      <span className="relative z-10">
                        {isEnterprise
                          ? "Contact Sales"
                          : isDemo
                          ? "Request Free Trial"
                          : isAuthenticated
                          ? "Buy / Upgrade Plan"
                          : "Get Started"}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </Button>
                  </div>
                </PricingTiltCard>
              </motion.div>
            );
          })}
        </div>

        {/* Feature Guarantees Row (Compact & Clean) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4"
        >
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Owner Seat Free</h4>
              <p className="text-[11px] text-slate-500">Company owner consumes 0 HR seats.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Protected Snapshots</h4>
              <p className="text-[11px] text-slate-500">Plan changes never alter active subscriber terms.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Tenant Isolation</h4>
              <p className="text-[11px] text-slate-500">Dedicated subdomains & isolated candidate data.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Razorpay Secured</h4>
              <p className="text-[11px] text-slate-500">Instant test & live mode subscription activation.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
