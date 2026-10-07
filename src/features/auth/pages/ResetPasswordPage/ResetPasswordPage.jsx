"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import { resetPasswordApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ResetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    try {
      setIsLoading(true);
      await resetPasswordApi({ token, newPassword });
      setSuccess(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to reset password. The token may be expired or invalid."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-sans bg-[#f8fafc]">
      {/* ── Left Side: Enterprise Branding ── */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 text-white p-12 lg:p-16 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-400/25 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-white text-blue-700 font-black text-lg flex items-center justify-center shadow-md">
              H
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              HireQuest
            </span>
          </Link>

          <div className="pt-10">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] mb-6">
              Securely Reset <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-300">
                Your Password.
              </span>
            </h1>
            <p className="text-lg text-blue-100/90 font-medium max-w-md leading-relaxed">
              Regain access to your account with our secure password recovery flow.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-xs text-blue-100/80 pt-6 border-t border-white/15 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            Secure Authentication
          </span>
          <span>•</span>
          <span>Encrypted Data</span>
        </div>
      </div>

      {/* ── Right Side: Reset Form ── */}
      <div className="flex flex-col justify-center items-center px-4 sm:px-8 lg:px-12 py-12 relative">
        <div className="lg:hidden text-center mb-6 space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-md">
              H
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">
              HireQuest
            </span>
          </Link>
        </div>

        <div className="w-full max-w-md space-y-6">
          <div className="space-y-1.5 text-left">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Reset Password
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Enter a new secure password for your account.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-8 shadow-xl shadow-slate-200/60">
            {success ? (
              <div className="space-y-6 text-center py-4">
                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900">
                    Password Reset!
                  </h3>
                  <p className="text-sm text-slate-500">
                    Your password has been successfully updated. You can now login with your new credentials.
                  </p>
                </div>
                <Button
                  className="w-full h-11 text-[15px] font-semibold bg-blue-600 hover:bg-blue-700 rounded-xl"
                  onClick={() => router.push("/login")}
                >
                  Return to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl font-medium">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-blue-600"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-blue-600"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !token}
                  className="w-full h-11 mt-2 text-[15px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
