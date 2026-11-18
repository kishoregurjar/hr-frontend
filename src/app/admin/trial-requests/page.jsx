"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Eye,
  Check,
  X,
  ExternalLink,
  Building2,
  Mail,
  Phone,
  Globe,
  Loader2,
  RefreshCw,
  Sparkles,
  Info,
  Calendar,
  UserCheck,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getAdminTrialRequests,
  getAdminTrialRequestById,
  approveAdminTrialRequest,
  rejectAdminTrialRequest,
  resendAdminTrialApprovalEmail,
  getAdminPlans,
} from "@/lib/api/admin";

export default function AdminTrialRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  // Dialog states
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [demoPlan, setDemoPlan] = useState(null);

  // Form states for approval/rejection
  const [internalNotes, setInternalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminTrialRequests({
        page,
        limit: 20,
        status: statusFilter,
        search,
      });

      setRequests(data?.requests || []);
      setCounts(data?.counts || { all: 0, pending: 0, approved: 0, rejected: 0 });
      setPagination(data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load trial requests.");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleOpenDetails = async (reqItem) => {
    try {
      const full = await getAdminTrialRequestById(reqItem.id);
      setSelectedRequest(full || reqItem);
      setIsDetailsOpen(true);
    } catch {
      setSelectedRequest(reqItem);
      setIsDetailsOpen(true);
    }
  };

  const handleOpenApprove = async (reqItem) => {
    setSelectedRequest(reqItem);
    setInternalNotes("");
    setIsApproveOpen(true);
    if (!demoPlan) {
      try {
        const plans = await getAdminPlans();
        const demo = Array.isArray(plans) ? plans.find((p) => p.code === "DEMO") : null;
        if (demo) setDemoPlan(demo);
      } catch (_) {}
    }
  };

  const handleOpenReject = (reqItem) => {
    setSelectedRequest(reqItem);
    setRejectionReason("Unable to verify legitimate business identity or domain.");
    setInternalNotes("");
    setIsRejectOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      const res = await approveAdminTrialRequest(selectedRequest.id, {
        internalNotes: internalNotes.trim() || undefined,
      });

      if (res?.emailSent === false) {
        toast.warning(
          res?.message ||
            "Trial approved and workspace activated, but the email could not be delivered. You can retry sending the approval email."
        );
      } else {
        toast.success(
          res?.message ||
            "Trial approved and workspace activated. Approval email sent to the Owner."
        );
      }

      setIsApproveOpen(false);
      setIsDetailsOpen(false);
      fetchRequests();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Approval failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResendApprovalEmail = async (reqItem) => {
    if (!reqItem) return;
    setActionLoading(true);
    try {
      const res = await resendAdminTrialApprovalEmail(reqItem.id);
      toast.success(
        res?.message || "Trial approved and workspace activated. Approval email sent to the Owner."
      );
      fetchRequests();
      if (selectedRequest && selectedRequest.id === reqItem.id) {
        setSelectedRequest((prev) => ({
          ...prev,
          approvalEmailSent: true,
          approvalEmailSentAt: new Date(),
          approvalEmailError: null,
        }));
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to deliver approval email. You can retry sending the approval email."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedRequest) return;
    if (!rejectionReason.trim()) {
      toast.error("Please enter or select a rejection reason.");
      return;
    }
    setActionLoading(true);
    try {
      const res = await rejectAdminTrialRequest(selectedRequest.id, {
        rejectionReason: rejectionReason.trim(),
        reviewNotes: internalNotes.trim() || undefined,
      });
      toast.success(res?.message || "Trial application rejected.");
      setIsRejectOpen(false);
      setIsDetailsOpen(false);
      fetchRequests();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Rejection failed.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* â”€â”€ Header â”€â”€ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Demo Trial Requests
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Review visitor trial applications, evaluate domain authenticity, and authorize 30-day workspaces.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRequests}
            disabled={loading}
            className="h-9 text-xs font-semibold gap-1.5 rounded-xl border-slate-200"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* â”€â”€ Stats Metric Cards â”€â”€ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Pending Review</span>
            <div className="h-7 w-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{counts.pending}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Awaiting Super Admin authorization</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Approved Trials</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{counts.approved}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Active workspaces provisioned</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Rejected</span>
            <div className="h-7 w-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{counts.rejected}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Declined trial applications</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Total Inquiries</span>
            <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{counts.all}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Lifetime visitor trial submissions</p>
        </div>
      </div>

      {/* â”€â”€ Filter Tabs & Search â”€â”€ */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          {[
            { label: "All", value: "ALL", count: counts.all },
            { label: "Pending", value: "PENDING_REVIEW", count: counts.pending },
            { label: "Approved", value: "APPROVED", count: counts.approved },
            { label: "Rejected", value: "REJECTED", count: counts.rejected },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                statusFilter === tab.value
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === tab.value ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search company, email, name..."
            className="h-9 pl-9 text-xs rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white"
          />
        </div>
      </div>

      {/* â”€â”€ Applications Table â”€â”€ */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            <span className="text-xs font-bold text-slate-500">Loading trial requests...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No trial requests found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {search || statusFilter !== "ALL"
                ? "No applications matched your filter criteria. Try clearing search filters."
                : "New visitor Demo trial requests will appear here for administrative review."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Organization & Domain</th>
                  <th className="py-3 px-4">Applicant & Contact</th>
                  <th className="py-3 px-4">Submission Date</th>
                  <th className="py-3 px-4">Risk & Abuse Checks</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {requests.map((item) => {
                  const isPending = item.status === "PENDING_REVIEW";
                  const isApproved = item.status === "APPROVED";
                  const isRejected = item.status === "REJECTED";

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Organization & Domain */}
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{item.companyName}</span>
                        </div>
                        {item.website ? (
                          <a
                            href={item.website.startsWith("http") ? item.website : `https://${item.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 mt-0.5 truncate max-w-[180px]"
                          >
                            <Globe className="h-3 w-3 shrink-0" />
                            <span>{item.website.replace(/^https?:\/\//, "")}</span>
                          </a>
                        ) : item.industry ? (
                          <div className="text-[11px] text-slate-500 mt-0.5 font-medium">{item.industry}</div>
                        ) : (
                          <div className="text-[11px] text-slate-400 mt-0.5">No website provided</div>
                        )}
                      </td>

                      {/* Applicant & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{item.ownerName}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-slate-600 font-mono">{item.businessEmail}</span>
                          {item.isBusinessEmail ? (
                            <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                              Business
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200" title="Free consumer email provider. Requires manual business review.">
                              Free Provider
                            </span>
                          )}
                        </div>
                        {item.phone && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                            <span>{item.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Submission Date */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        <div>
                          {new Date(item.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(item.createdAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      {/* Risk & Abuse Warnings */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {item.warnings?.hasExistingCompanyConflict && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                              <AlertTriangle className="h-3 w-3 shrink-0" />
                              Company Name Exists
                            </span>
                          )}
                          {item.warnings?.hasExistingUserConflict && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200">
                              <AlertTriangle className="h-3 w-3 shrink-0" />
                              Account Exists
                            </span>
                          )}
                          {item.warnings?.sharedIpCount > 1 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 font-bold text-[10px] border border-orange-200">
                              {item.warnings.sharedIpCount} Requests from IP
                            </span>
                          )}
                          {!item.warnings?.hasExistingCompanyConflict &&
                            !item.warnings?.hasExistingUserConflict &&
                            !item.warnings?.sharedIpCount && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                                Clean Eligibility
                              </span>
                            )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isPending && (
                          <Badge className="bg-amber-100 text-amber-800 border-none font-bold text-[11px] px-2.5 py-0.5 flex items-center gap-1 w-fit">
                            <Clock className="h-3 w-3" />
                            Pending Review
                          </Badge>
                        )}
                        {isApproved && (
                          <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold text-[11px] px-2.5 py-0.5 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="h-3 w-3" />
                            Approved
                          </Badge>
                        )}
                        {isRejected && (
                          <Badge className="bg-rose-100 text-rose-800 border-none font-bold text-[11px] px-2.5 py-0.5 flex items-center gap-1 w-fit">
                            <XCircle className="h-3 w-3" />
                            Rejected
                          </Badge>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDetails(item)}
                            className="h-8 px-2.5 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Details
                          </Button>

                          {isPending && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleOpenApprove(item)}
                                className="h-8 px-2.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                              >
                                <Check className="h-3.5 w-3.5 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenReject(item)}
                                className="h-8 px-2.5 text-xs font-bold rounded-lg text-rose-600 border-rose-200 hover:bg-rose-50"
                              >
                                <X className="h-3.5 w-3.5 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}

                          {isApproved && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResendApprovalEmail(item)}
                              disabled={actionLoading}
                              className="h-8 px-2 text-[11px] font-semibold rounded-lg text-blue-700 border-blue-200 hover:bg-blue-50"
                              title="Resend workspace approval notification email"
                            >
                              <Mail className="h-3 w-3 mr-1 text-blue-600" />
                              Resend Email
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* â”€â”€ View Details Modal â”€â”€ */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-xl rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600" />
              <span>Trial Application Details</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Complete submitted data and verification history for this organization.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-2 text-xs">
              {/* Application Summary Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Company Name</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedRequest.companyName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Applicant Owner</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedRequest.ownerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Business Email</span>
                    <span className="font-mono font-bold text-slate-800">{selectedRequest.businessEmail}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Phone Number</span>
                    <span className="font-bold text-slate-800">{selectedRequest.phone || "Not provided"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Website / Domain</span>
                    {selectedRequest.website ? (
                      <a
                        href={selectedRequest.website.startsWith("http") ? selectedRequest.website : `https://${selectedRequest.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
                      >
                        {selectedRequest.website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-slate-400">Not provided</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Industry Sector</span>
                    <span className="font-semibold text-slate-800">{selectedRequest.industry || "General"}</span>
                  </div>
                </div>

                {selectedRequest.businessDescription && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Business Overview</span>
                    <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 leading-relaxed">
                      {selectedRequest.businessDescription}
                    </p>
                  </div>
                )}
              </div>

              {/* Technical / Audit Details */}
              <div className="p-3.5 rounded-2xl bg-slate-50/60 border border-slate-200 space-y-1.5 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">Email Verification:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified via 6-Digit OTP
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">Submission Timestamp:</span>
                  <span>{new Date(selectedRequest.createdAt).toLocaleString("en-IN")}</span>
                </div>
                {selectedRequest.ipAddress && (
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Applicant IP Address:</span>
                    <span className="font-mono">{selectedRequest.ipAddress}</span>
                  </div>
                )}
                {selectedRequest.approvedCompanySlug && (
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Provisioned Subdomain:</span>
                    <span className="font-mono font-bold text-indigo-600">{selectedRequest.approvedCompanySlug}</span>
                  </div>
                )}
                {selectedRequest.status === "APPROVED" && (
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                    <span className="font-semibold text-slate-500">Approval Email Status:</span>
                    {selectedRequest.approvalEmailSent ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        Delivered to Owner
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                        <AlertTriangle className="h-3 w-3 text-amber-600" />
                        Delivery Pending / Failed
                      </span>
                    )}
                  </div>
                )}
                {selectedRequest.rejectionReason && (
                  <div className="flex justify-between text-rose-700">
                    <span className="font-semibold">Rejection Reason:</span>
                    <span className="font-bold">{selectedRequest.rejectionReason}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsDetailsOpen(false)} className="rounded-xl">
              Close
            </Button>
            {selectedRequest?.status === "APPROVED" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleResendApprovalEmail(selectedRequest)}
                disabled={actionLoading}
                className="rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50 font-bold"
              >
                <Mail className="h-3.5 w-3.5 mr-1" />
                Resend Approval Email
              </Button>
            )}
            {selectedRequest?.status === "PENDING_REVIEW" && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    handleOpenApprove(selectedRequest);
                  }}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Approve Application
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    handleOpenReject(selectedRequest);
                  }}
                  className="rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50 font-bold"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Reject
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* â”€â”€ Approve Trial Confirmation Dialog â”€â”€ */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span>Approve Demo Trial Application</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              This action will provision the company workspace, create the owner account, and start the 30-day timer.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <div className="font-bold text-emerald-950 text-sm">
                  {selectedRequest.companyName}
                </div>
                <div className="text-emerald-800 text-[11px] font-medium">
                  Owner: {selectedRequest.ownerName} ({selectedRequest.businessEmail})
                </div>

                <div className="pt-2 border-t border-emerald-200/80 text-[11px] text-emerald-900 space-y-1">
                  <div className="font-bold uppercase tracking-wider text-[10px] text-emerald-700">Entitlements Provisioned:</div>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li><strong>{demoPlan?.seatLimit ?? 2} Active HR Seats</strong> (Owner always included)</li>
                    <li><strong>{demoPlan?.candidateLimit ?? 20} Lifetime Candidates</strong> pool</li>
                    <li><strong>{demoPlan?.inviteLimit ?? 10} Monthly Assessment Invites</strong></li>
                    <li><strong>{demoPlan?.durationDays ? `${demoPlan.durationDays * 24} Hours (${demoPlan.durationDays} Days)` : "720 Hours (30 Days)"}</strong> duration from approval moment</li>
                  </ul>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Internal Review Notes (Optional)
                </label>
                <Textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="e.g. Verified company domain via LinkedIn, legitimate boutique consultancy."
                  className="text-xs rounded-xl border-slate-200"
                  rows={2}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsApproveOpen(false)}
              disabled={actionLoading}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmApprove}
              disabled={actionLoading}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Provisioning Workspace...
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Authorize & Provision Trial
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* â”€â”€ Reject Application Confirmation Dialog â”€â”€ */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-rose-600" />
              <span>Reject Trial Application</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Decline this trial request. An automated status update email will be sent to the applicant.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900">
                <div className="font-bold">{selectedRequest.companyName}</div>
                <div className="text-[11px] text-rose-700 mt-0.5">{selectedRequest.businessEmail}</div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Rejection Reason (Visible to Applicant in Email) *
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 mb-2"
                >
                  <option value="Unable to verify legitimate business identity or domain.">
                    Unable to verify legitimate business identity or domain
                  </option>
                  <option value="Duplicate company evaluation request detected.">
                    Duplicate company evaluation request detected
                  </option>
                  <option value="Evaluation request does not meet minimum business criteria.">
                    Evaluation request does not meet minimum business criteria
                  </option>
                  <option value="Incomplete or invalid business contact information.">
                    Incomplete or invalid business contact information
                  </option>
                </select>

                <Input
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Or enter custom rejection reason..."
                  className="text-xs rounded-xl border-slate-200"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Internal Review Notes (Private to Admins)
                </label>
                <Textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="e.g. Registered with suspicious free disposable proxy."
                  className="text-xs rounded-xl border-slate-200"
                  rows={2}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRejectOpen(false)}
              disabled={actionLoading}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmReject}
              disabled={actionLoading}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Rejecting...
                </>
              ) : (
                <>
                  <X className="h-3.5 w-3.5 mr-1.5" />
                  Confirm Rejection
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

