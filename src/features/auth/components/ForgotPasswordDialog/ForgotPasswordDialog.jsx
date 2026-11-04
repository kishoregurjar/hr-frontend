"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  KeyRound,
  Loader2,
  Mail,
  Send,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { forgotPasswordApi } from "@/lib/api/auth";

const ForgotPasswordDialog = ({ initialEmail = "" }) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your registered email address.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await forgotPasswordApi(email.trim());
      setIsSent(true);
      toast.success(res?.message || "Password reset request processed.");
    } catch (err) {
      setError(err?.message || "Failed to send reset link. Please check your email.");
      toast.error(err?.message || "Failed to send reset link.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    if (!newOpen) {
      setTimeout(() => {
        setIsSent(false);
        setError(null);
      }, 300);
    } else if (initialEmail && !email) {
      setEmail(initialEmail);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer focus:outline-none transition-colors"
        >
          Forgot password?
        </button>
      </DialogTrigger>

      <DialogContent className="w-[92vw] sm:max-w-md p-6 sm:p-7 rounded-3xl border border-slate-200/90 bg-white shadow-2xl relative overflow-hidden space-y-4">
        {/* Top Accent Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

        <DialogHeader className="space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 shrink-0">
            <KeyRound className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight pt-1">
            Reset Your Password
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            Enter your work email address and we&apos;ll send you instructions to reset your password.
          </DialogDescription>
        </DialogHeader>

        {isSent ? (
          <div className="space-y-5 pt-2">
            <div className="rounded-2xl bg-gradient-to-b from-emerald-50/80 to-teal-50/30 border border-emerald-100 p-6 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 ring-4 ring-emerald-50">
                <CheckCircle2 className="h-7 w-7 stroke-[2.5]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Request Processed
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  If an account exists with this email, a password reset link has been dispatched to:
                </p>
                <div className="pt-1">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-emerald-200/80 text-slate-900 font-bold text-xs shadow-xs max-w-full">
                    <Mail className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{email}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 pt-1">
                Please check your inbox & spam folder. The link will expire shortly for security.
              </p>
            </div>

            <Button
              type="button"
              className="w-full h-11 sm:h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              onClick={() => setOpen(false)}
            >
              Back to Sign In
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Work Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="hr@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 sm:h-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-medium shadow-xs"
                  required
                  autoFocus
                />
              </div>
            </div>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full h-11 sm:h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending Link...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Reset Link
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordDialog;
