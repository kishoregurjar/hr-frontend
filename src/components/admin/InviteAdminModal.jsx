"use client";

import { useState } from "react";
import { X, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { invitePlatformAdmin } from "@/lib/api/admin";

export default function InviteAdminModal({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || trimmedName.length < 2) {
      setError("Please enter a valid full name (minimum 2 characters).");
      return;
    }

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);

    try {
      await invitePlatformAdmin({
        name: trimmedName,
        email: trimmedEmail,
      });

      setSuccessMessage(`Invitation successfully sent to ${trimmedEmail}!`);
      setName("");
      setEmail("");

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        setSuccessMessage("");
        onClose();
      }, 1500);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to send invitation. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    setError("");
    setSuccessMessage("");
    setName("");
    setEmail("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-card border shadow-xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Invite Platform Admin</h3>
              <p className="text-xs text-muted-foreground">
                Send an invitation to grant Super Admin access
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            {successMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          <div className="space-y-1.5">
            <label className="block text-slate-700 font-semibold">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              className="w-full h-10 px-3 rounded-xl border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition disabled:opacity-60"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-slate-700 font-semibold">Email Address</label>
            <input
              type="email"
              placeholder="e.g. rahul@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              className="w-full h-10 px-3 rounded-xl border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition disabled:opacity-60"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border text-[11px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Platform Role Assignment:</p>
            <p>• Role: <span className="font-bold text-purple-700">SUPER_ADMIN</span></p>
            <p>• Associated Company: <span className="font-bold text-slate-700">Independent</span></p>
            <p>• Activation: Link sent via email for password setup</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
              className="h-10 px-4 rounded-xl text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-2 shadow-md shadow-blue-500/20"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
