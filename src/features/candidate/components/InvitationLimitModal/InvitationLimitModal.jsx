"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, ArrowUpRight, Crown, Sparkles, AlertCircle } from "lucide-react";

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
import { Progress } from "@/components/ui/progress";

export default function InvitationLimitModal({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  allowedLimit: propAllowedLimit,
  currentUsage: propCurrentUsage,
  remaining: propRemaining,
  currentPlan: propCurrentPlan,
  requested: propRequested,
  message: propMessage,
}) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    allowedLimit: propAllowedLimit ?? 5,
    currentUsage: propCurrentUsage ?? 5,
    remaining: propRemaining ?? 0,
    currentPlan: propCurrentPlan ?? "Current Plan",
    requested: propRequested ?? null,
    message: propMessage ?? null,
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
    if (
      propAllowedLimit !== undefined ||
      propCurrentUsage !== undefined ||
      propRemaining !== undefined ||
      propCurrentPlan !== undefined ||
      propRequested !== undefined ||
      propMessage !== undefined
    ) {
      setModalData((prev) => ({
        allowedLimit: propAllowedLimit ?? prev.allowedLimit,
        currentUsage: propCurrentUsage ?? prev.currentUsage,
        remaining: propRemaining ?? prev.remaining,
        currentPlan: propCurrentPlan ?? prev.currentPlan,
        requested: propRequested ?? prev.requested,
        message: propMessage ?? prev.message,
      }));
    }
  }, [propAllowedLimit, propCurrentUsage, propRemaining, propCurrentPlan, propRequested, propMessage]);

  // Listen for global invitation limit reached custom events (from API or frontend triggers)
  useEffect(() => {
    const handleLimitReached = (event) => {
      const detail = event?.detail || {};
      setModalData({
        allowedLimit: detail.allowedLimit ?? 5,
        currentUsage: detail.currentUsage ?? 5,
        remaining: detail.remaining ?? 0,
        currentPlan: detail.currentPlan || "Current Plan",
        requested: detail.requested ?? null,
        message: detail.message || null,
      });
      setOpen(true);
    };

    window.addEventListener("hirequest:invitation-limit-reached", handleLimitReached);
    return () => {
      window.removeEventListener("hirequest:invitation-limit-reached", handleLimitReached);
    };
  }, []);

  const handleUpgradeClick = () => {
    setOpen(false);
    router.push("/company/plans");
  };

  const { allowedLimit, currentUsage, remaining, currentPlan, requested, message } = modalData;
  const usagePercentage = allowedLimit > 0 ? Math.min(100, Math.round((currentUsage / allowedLimit) * 100)) : 100;

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="w-[92vw] sm:max-w-[490px] p-0 overflow-hidden rounded-3xl border border-indigo-200/80 shadow-2xl font-sans bg-white">
        {/* ── Signature Gradient Header ── */}
        <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 p-6 text-white relative overflow-hidden select-none">
          <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute top-2 right-10 w-24 h-24 rounded-full border border-white/15 pointer-events-none" />

          <div className="relative z-10 flex items-start gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-bold text-white shadow-inner shrink-0">
              <Send className="h-5 w-5 text-white" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl font-extrabold tracking-tight text-white drop-shadow-xs">
                  Invitation Limit Reached
                </DialogTitle>
                <Badge className="bg-white/20 text-white border-white/30 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                  Monthly Quota
                </Badge>
              </div>
              <DialogDescription className="text-xs text-white/90 font-medium leading-relaxed">
                Your monthly assessment invitation capacity for this billing cycle has been reached.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* ── Modal Body ── */}
        <div className="p-6 space-y-4">
          <div className="rounded-2xl bg-indigo-50/70 border border-indigo-100 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                Plan: <span className="font-extrabold text-indigo-700">{currentPlan}</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Monthly Allowance
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-700 leading-relaxed">
              Your plan includes a monthly maximum of{" "}
              <strong className="font-extrabold text-indigo-900">{allowedLimit}</strong> assessment invitations.
              You have currently dispatched{" "}
              <strong className="font-extrabold text-indigo-900">{currentUsage}</strong> invitations
              ({remaining} remaining this month).
            </p>

            {/* Quota Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-600">Dispatched Invites</span>
                <span className={remaining <= 0 ? "text-rose-600" : "text-indigo-600"}>
                  {currentUsage} / {allowedLimit} ({usagePercentage}%)
                </span>
              </div>
              <Progress
                value={usagePercentage}
                className="h-2 rounded-full bg-indigo-100"
              />
            </div>
          </div>

          {message && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-medium">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 space-y-2">
            <p className="text-xs font-bold text-slate-800">
              Need to invite more candidates right now?
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-white border border-slate-200/70">
                <p className="font-bold text-slate-900">Growth Plan</p>
                <p className="text-indigo-600 font-extrabold">300 invites/mo</p>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200/70">
                <p className="font-bold text-slate-900">Business Plan</p>
                <p className="text-indigo-600 font-extrabold">1,000 invites/mo</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer CTAs ── */}
        <DialogFooter className="p-6 pt-0 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end bg-white">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto text-xs font-semibold h-10 px-5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Close
          </Button>

          <Button
            type="button"
            onClick={handleUpgradeClick}
            className="w-full sm:w-auto text-xs font-bold h-10 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-md shadow-indigo-500/25 gap-1.5 cursor-pointer"
          >
            <Crown className="h-3.5 w-3.5 text-amber-300 shrink-0" />
            <span>Upgrade Subscription</span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-80" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

