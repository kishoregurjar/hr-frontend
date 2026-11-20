"use client";

import { useState, useEffect } from "react";
import {
  Tag,
  Copy,
  Check,
  Sparkles,
  Repeat,
  Calendar,
  Layers,
  ChevronRight,
  Info,
  Gift,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPublicOffers } from "@/lib/api/plans";

export default function AvailableOffersSection({
  billingCycle = "MONTHLY",
  selectedPlan = null,
  selectedOffer = null,
  onSelectOffer,
  className = "",
}) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchOffers() {
      setLoading(true);
      try {
        const fetched = await getPublicOffers({
          billingCycle,
          planCode: selectedPlan || undefined,
        });
        if (isMounted) {
          const list = Array.isArray(fetched) ? fetched : [];
          setOffers(list);

          // If the currently selected offer is not eligible for the new billing cycle/plan, unselect it
          if (selectedOffer && !list.some((o) => o.code === selectedOffer.code)) {
            if (onSelectOffer) onSelectOffer(null);
            toast.info(
              `Offer "${selectedOffer.code}" is not applicable to the ${billingCycle.toLowerCase()} cycle.`
            );
          }
        }
      } catch (err) {
        if (isMounted) setOffers([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchOffers();

    return () => {
      isMounted = false;
    };
  }, [billingCycle, selectedPlan]);

  const handleCopyCode = (e, code) => {
    e.stopPropagation();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(`Copied promo code "${code}" to clipboard!`);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  };

  const handleToggleOffer = (offer) => {
    if (!onSelectOffer) return;
    if (selectedOffer?.code === offer.code) {
      onSelectOffer(null);
      toast.info(`Offer "${offer.code}" unselected.`);
    } else {
      onSelectOffer(offer);
      toast.success(`🎉 Offer "${offer.code}" applied! Select your plan below to checkout.`);
    }
  };

  // If loading and no offers yet, render subtle placeholder
  if (loading && offers.length === 0) {
    return null;
  }

  // If no public offers exist for this criteria, collapse cleanly
  if (!loading && offers.length === 0) {
    return null;
  }

  return (
    <div className={`w-full max-w-5xl mx-auto my-6 sm:my-8 transition-all duration-300 ${className}`}>
      {/* Container Box */}
      <div className="rounded-3xl border border-blue-200/90 bg-gradient-to-b from-blue-50/70 via-white to-white p-4 sm:p-6 shadow-sm">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-5 pb-3 border-b border-blue-100/80">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Gift className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  Available Promotional Offers
                </h3>
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 text-[10px] font-bold">
                  {offers.length} {offers.length === 1 ? "Offer" : "Offers"} Active
                </Badge>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Select an offer below to automatically apply discounts during checkout.
              </p>
            </div>
          </div>

          {selectedOffer && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>
                Offer <strong>{selectedOffer.code}</strong> selected for checkout
              </span>
            </div>
          )}
        </div>

        {/* Offers Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {offers.map((offer) => {
            const isSelected = selectedOffer?.code === offer.code;
            const isEveryRenewal = offer.applicability === "EVERY_RENEWAL";
            const isPercentage = offer.discountType === "PERCENTAGE";
            const isCopied = copiedCode === offer.code;

            return (
              <div
                key={offer.code}
                onClick={() => handleToggleOffer(offer)}
                className={`group relative rounded-2xl p-4 sm:p-4.5 flex flex-col justify-between transition-all duration-200 cursor-pointer border ${
                  isSelected
                    ? "bg-white border-blue-600 ring-2 ring-blue-500/30 shadow-md scale-[1.01]"
                    : "bg-white/80 hover:bg-white border-slate-200/90 hover:border-blue-300 shadow-2xs hover:shadow-sm"
                }`}
              >
                <div>
                  {/* Top Row: Code Pill + Copy Button & Applicability Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    {/* Coupon Code Pill */}
                    <div className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-lg border border-slate-200/90 transition-colors">
                      <Tag className="h-3 w-3 text-blue-600 shrink-0" />
                      <span className="font-mono font-black text-xs tracking-wider text-slate-900">
                        {offer.code}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleCopyCode(e, offer.code)}
                        className="text-slate-400 hover:text-slate-800 p-0.5 rounded transition-colors"
                        title="Copy coupon code"
                      >
                        {isCopied ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Applicability Badge */}
                    {isEveryRenewal ? (
                      <Badge
                        variant="outline"
                        className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] font-bold px-2 py-0.5 flex items-center gap-1"
                      >
                        <Repeat className="h-2.5 w-2.5" />
                        Every Renewal
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold px-2 py-0.5 flex items-center gap-1"
                      >
                        <Sparkles className="h-2.5 w-2.5" />
                        First Purchase
                      </Badge>
                    )}
                  </div>

                  {/* Discount Value */}
                  <div className="mb-1.5">
                    <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
                      <span>{isPercentage ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} FLAT OFF`}</span>
                    </div>
                    {isPercentage && offer.maxDiscountAmount && (
                      <span className="text-[11px] font-medium text-slate-500">
                        Maximum discount up to ₹{Number(offer.maxDiscountAmount).toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>

                  {/* Customer-Facing Description */}
                  <p className="text-xs text-slate-600 leading-snug line-clamp-2 mb-3">
                    {offer.publicDescription || offer.name || "Exclusive discount applied to eligible subscriptions."}
                  </p>
                </div>

                {/* Bottom Metadata & Action Button */}
                <div className="pt-2 border-t border-slate-100 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate max-w-[150px]">
                      {Array.isArray(offer.applicablePlans) && offer.applicablePlans.length > 0
                        ? `Plans: ${offer.applicablePlans.join(", ")}`
                        : "All Plans"}
                    </span>
                    {offer.validUntil && (
                      <span className="shrink-0 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Exp {new Date(offer.validUntil).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      </span>
                    )}
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant={isSelected ? "outline" : "default"}
                    className={`w-full h-8 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 shadow-2xs"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                    }`}
                  >
                    {isSelected ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" />
                        Offer Applied
                      </span>
                    ) : (
                      "Apply This Offer"
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
