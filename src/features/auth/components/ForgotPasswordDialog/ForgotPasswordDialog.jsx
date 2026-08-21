"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, KeyRound, Loader2, Mail, Send } from "lucide-react";

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
      await forgotPasswordApi(email.trim());
      setIsSent(true);
      toast.success("Password reset link sent to your email!");
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

      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-2 border border-blue-100">
            <KeyRound className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Reset Your Password
          </DialogTitle>
          <DialogDescription className="text-slate-600 text-xs sm:text-sm">
            Enter your work email address and we&apos;ll send you instructions to reset your password.
          </DialogDescription>
        </DialogHeader>

        {isSent ? (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Check Your Inbox
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We have sent password reset instructions to: <br />
                <span className="font-semibold text-slate-800">{email}</span>
              </p>
            </div>

            <Button
              type="button"
              className="w-full mt-2 font-medium"
              onClick={() => setOpen(false)}
            >
              Back to Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-xs font-semibold text-slate-700">
                Work Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="hr@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 text-sm"
                  required
                  autoFocus
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Link...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Reset Link
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordDialog;
