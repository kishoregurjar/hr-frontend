"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowUpRight, Crown, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function CandidateLimitModal({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  allowedLimit: propAllowedLimit,
  currentUsage: propCurrentUsage,
  currentPlan: propCurrentPlan,
}) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    allowedLimit: propAllowedLimit ?? 5,
    currentUsage: propCurrentUsage ?? 5,
    currentPlan: propCurrentPlan ?? "Current Plan",
  });

  const isControlled = typeof controlledOpen === "boolean";
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setOpen = (nextOpen) => {
    if (controlledOnOpenChange) {
      controlledOnOpenChange(nextOpen);
    }
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
  };

  useEffect(() => {
    if (propAllowedLimit !== undefined || propCurrentUsage !== undefined || propCurrentPlan !== undefined) {
      setModalData((prev) => ({
        allowedLimit: propAllowedLimit ?? prev.allowedLimit,
        currentUsage: propCurrentUsage ?? prev.currentUsage,
        currentPlan: propCurrentPlan ?? prev.currentPlan,
      }));
    }
  }, [propAllowedLimit, propCurrentUsage, propCurrentPlan]);

  // Listen for global candidate limit reached custom events
  useEffect(() => {
    const handleLimitReached = (event) => {
      const detail = event?.detail || {};
      setModalData({
        allowedLimit: detail.allowedLimit ?? 5,
        currentUsage: detail.currentUsage ?? 5,
        currentPlan: detail.currentPlan || "Current Plan",
      });
      setOpen(true);
    };

    window.addEventListener("hirequest:candidate-limit-reached", handleLimitReached);
    return () => {
      window.removeEventListener("hirequest:candidate-limit-reached", handleLimitReached);
    };
  }, []);

  const handleUpgradeClick = () => {
    setOpen(false);
    router.push("/company/plans");
  };

  const { allowedLimit, currentUsage, currentPlan } = modalData;

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="w-[92vw] sm:max-w-[480px] p-0 overflow-hidden rounded-3xl border border-rose-200/60 shadow-2xl font-sans bg-white">
        {/* ── Signature Gradient Header ── */}
        <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 p-6 text-white relative overflow-hidden select-none">
          <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute top-2 right-10 w-24 h-24 rounded-full border border-white/15 pointer-events-none" />

          <div className="relative z-10 flex items-start gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-bold text-white shadow-inner shrink-0">
              <ShieldAlert className="h-6 w-6 text-white" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl font-extrabold tracking-tight text-white drop-shadow-xs">
                  Candidate Limit Reached
                </DialogTitle>
                <Badge className="bg-white/20 text-white border-white/30 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                  Quota Full
                </Badge>
              </div>
              <DialogDescription className="text-xs text-white/90 font-medium leading-relaxed">
                Your organization has reached the maximum allowed unique candidates for this subscription tier.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* ── Modal Body ── */}
        <div className="p-6 space-y-4">
          <div className="rounded-2xl bg-rose-50/70 border border-rose-100 p-4 space-y-3">
            <p className="text-sm font-semibold text-rose-950 leading-relaxed">
              Your current plan allows a maximum of{" "}
              <span className="font-extrabold text-rose-700 underline decoration-rose-300 decoration-2">
                {allowedLimit}
              </span>{" "}
              unique candidates. You have already used{" "}
              <span className="font-extrabold text-rose-700 underline decoration-rose-300 decoration-2">
                {currentUsage}
              </span>{" "}
              slots.
            </p>

            <div className="flex items-center justify-between text-xs text-slate-600 bg-white/80 p-3 rounded-xl border border-rose-100/80">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <Users className="h-4 w-4 text-rose-600" />
                Active Candidate Slots
              </span>
              <span className="font-mono font-extrabold text-rose-600 text-sm">
                {currentUsage} / {allowedLimit} used (100%)
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            To add more candidates, import new applicant profiles, or send more invitations, please upgrade to a higher tier plan with increased candidate capacity.
          </p>
        </div>

        {/* ── Footer CTAs ── */}
        <DialogFooter className="p-6 pt-0 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end bg-white">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto text-xs font-semibold h-10 px-5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleUpgradeClick}
            className="w-full sm:w-auto text-xs font-bold h-10 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white shadow-md shadow-indigo-500/25 gap-1.5 cursor-pointer"
          >
            <Crown className="h-3.5 w-3.5 text-amber-300 shrink-0" />
            <span>Upgrade Plan</span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-80" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

