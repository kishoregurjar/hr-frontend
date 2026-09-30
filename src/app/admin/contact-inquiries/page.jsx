"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  MessageSquare,
  Clock,
  Send,
  RefreshCw,
  Inbox,
  User,
  Mail,
  X,
  Search,
  Filter,
  CheckCircle2,
  MoreHorizontal,
  CircleDashed
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  getAdminContactInquiries,
  updateContactInquiryStatus,
  replyContactInquiry,
} from "@/lib/api/publicContact";

const STATUS_CONFIG = {
  OPEN: {
    label: "Open",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: CircleDashed,
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: MoreHorizontal,
  },
  RESOLVED: {
    label: "Resolved",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: CheckCircle2,
  },
};

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
];

export default function AdminContactInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  const fetchInquiries = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch a larger set (up to the backend limit of 100) and filter/paginate locally to enable accurate stats & fast search
      const params = { limit: 100, sortOrder: "desc" };
      const data = await getAdminContactInquiries(params);
      setInquiries(data.items || []);
    } catch (err) {
      toast.error("Failed to load public contact inquiries.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleStatusChange = async (inquiryId, newStatus) => {
    try {
      setIsUpdatingStatus(true);
      await updateContactInquiryStatus(inquiryId, newStatus);
      toast.success(`Status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}.`);
      setInquiries((prev) => 
        prev.map(i => i.id === inquiryId ? { ...i, status: newStatus } : i)
      );
      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus } : prev));
      }
    } catch (err) {
      toast.error(err?.message || "Failed to update status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedInquiry) return;
    try {
      setIsReplying(true);
      const result = await replyContactInquiry(selectedInquiry.id, replyText.trim());
      if (result?.emailSent === false) {
        toast.warning("Reply saved but email delivery failed.");
      } else {
        toast.success("Reply sent successfully!");
      }
      setReplyText("");
      
      const updatedInquiry = {
        ...selectedInquiry,
        adminReply: replyText.trim(),
        repliedAt: new Date().toISOString(),
        status: "RESOLVED",
      };

      setInquiries((prev) =>
        prev.map((i) => (i.id === selectedInquiry.id ? updatedInquiry : i))
      );
      setSelectedInquiry(updatedInquiry);
    } catch (err) {
      toast.error(err?.message || "Failed to send reply.");
    } finally {
      setIsReplying(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Derived state for stats
  const stats = {
    total: inquiries.length,
    open: inquiries.filter(i => i.status === "OPEN").length,
    inProgress: inquiries.filter(i => i.status === "IN_PROGRESS").length,
    resolved: inquiries.filter(i => i.status === "RESOLVED").length,
  };

  // Derived state for filtered list
  const filteredInquiries = inquiries.filter(req => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      req.subject?.toLowerCase().includes(q) || 
      req.fullName?.toLowerCase().includes(q) || 
      req.email?.toLowerCase().includes(q);
    const matchesStatus = statusFilter ? req.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredInquiries.length / ITEMS_PER_PAGE) || 1;
  const paginatedInquiries = filteredInquiries.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
      <AdminHeader title="Public Contact Inquiries" />
      
      <main className="p-4 md:p-8 max-w-full mx-auto space-y-6">
        {/* Page Header Area */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inquiries Inbox</h1>
            <p className="text-sm text-slate-500 mt-1">Manage and respond to messages from the public contact form.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchInquiries}
            disabled={isLoading}
            className="text-xs font-semibold gap-2 shadow-sm bg-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-blue-600" : "text-slate-500"}`} />
            Refresh Data
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-center">
            <span className="text-sm font-medium text-slate-500">Total Inquiries</span>
            <span className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</span>
          </div>
          <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-sm flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <CircleDashed className="h-12 w-12 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-amber-700">Open</span>
            <span className="text-2xl font-bold text-amber-900 mt-1">{stats.open}</span>
          </div>
          <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-sm flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <MoreHorizontal className="h-12 w-12 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-700">In Progress</span>
            <span className="text-2xl font-bold text-blue-900 mt-1">{stats.inProgress}</span>
          </div>
          <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-sm flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-emerald-700">Resolved</span>
            <span className="text-2xl font-bold text-emerald-900 mt-1">{stats.resolved}</span>
          </div>
        </div>

        {/* Main List Container */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
          
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b border-slate-100">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by subject, name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            
            {/* Status Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatusFilter(opt.value)}
                  className={`flex-1 sm:flex-none text-xs font-semibold px-4 py-2 rounded-md transition-all whitespace-nowrap ${
                    statusFilter === opt.value
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table Area */}
          {isLoading ? (
            <div className="flex flex-col space-y-4 p-6">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="animate-pulse flex items-center space-x-4">
                  <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/4"></div>
                  </div>
                  <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
                </div>
              ))}
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
              <div className="h-16 w-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-2">
                <Inbox className="h-7 w-7 text-slate-400" />
              </div>
              <p className="text-base text-slate-800 font-bold">No inquiries found</p>
              <p className="text-sm text-slate-500 max-w-sm">
                {searchQuery || statusFilter
                  ? "We couldn't find any inquiries matching your current filters."
                  : "Your inbox is empty. New messages from the public contact form will appear here."}
              </p>
              {(searchQuery || statusFilter) && (
                <Button 
                  variant="link" 
                  onClick={() => { setSearchQuery(""); setStatusFilter(""); }}
                  className="text-blue-600 h-auto p-0 mt-2"
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap w-16">
                      Sr. No.
                    </th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Subject & Message
                    </th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Requester
                    </th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Date
                    </th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedInquiries.map((req, index) => {
                    const statusCfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.OPEN;
                    const srNo = (page - 1) * ITEMS_PER_PAGE + index + 1;
                    
                    const initials = req.fullName
                      ? req.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                      : '?';

                    return (
                      <tr
                        key={req.id}
                        className="hover:bg-slate-50 transition-colors group cursor-pointer"
                        onClick={() => setSelectedInquiry(req)}
                      >
                        <td className="px-6 py-4 align-top w-16">
                          <span className="text-xs font-semibold text-slate-500">
                            {srNo}
                          </span>
                        </td>
                        <td className="px-6 py-4 align-top w-2/5">
                          <p className="text-sm font-bold text-slate-800 line-clamp-1 mb-1">
                            {req.subject}
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-1 pr-4">
                            {req.message}
                          </p>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[11px] font-bold shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">
                                {req.fullName}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate">{req.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusCfg.color}`}
                          >
                            <statusCfg.icon className="h-3 w-3" />
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <p className="text-xs text-slate-500 font-medium whitespace-nowrap mt-1">
                            {formatDate(req.createdAt)}
                          </p>
                        </td>
                        <td className="px-6 py-4 align-top text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100 font-semibold gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInquiry(req);
                            }}
                          >
                            <MessageSquare className="h-4 w-4" />
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination Controls */}
          {!isLoading && filteredInquiries.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
              <p className="text-xs font-medium text-slate-500">
                Showing <span className="font-bold text-slate-700">{(page - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
                <span className="font-bold text-slate-700">
                  {Math.min(page * ITEMS_PER_PAGE, filteredInquiries.length)}
                </span>{" "}
                of <span className="font-bold text-slate-700">{filteredInquiries.length}</span> inquiries
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 text-xs font-medium px-3"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const p = i + 1;
                    // simple pagination logic to show max 5 buttons (always showing edges)
                    if (
                      p === 1 || 
                      p === totalPages || 
                      (p >= page - 1 && p <= page + 1)
                    ) {
                      return (
                        <Button
                          key={p}
                          variant={page === p ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setPage(p)}
                          className={`h-8 w-8 p-0 text-xs font-semibold ${
                            page === p ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {p}
                        </Button>
                      );
                    } else if (
                      (p === page - 2 && page > 3) || 
                      (p === page + 2 && page < totalPages - 2)
                    ) {
                      return <span key={p} className="text-slate-400 text-xs px-1">...</span>;
                    }
                    return null;
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 text-xs font-medium px-3"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Slide-over Detail Drawer */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
            onClick={() => {
              setSelectedInquiry(null);
              setReplyText("");
            }} 
          />
          
          {/* Drawer Panel */}
          <div className="relative w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-200 border-l border-slate-200">
            
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900">Inquiry Details</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  setSelectedInquiry(null);
                  setReplyText("");
                }}
                className="h-8 w-8 text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Drawer Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Header Info */}
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-xl font-bold text-slate-900 leading-snug">{selectedInquiry.subject}</h3>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${STATUS_CONFIG[selectedInquiry.status]?.color || STATUS_CONFIG.OPEN.color}`}
                >
                  {STATUS_CONFIG[selectedInquiry.status]?.label}
                </span>
              </div>

              {/* Requester Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 border-y border-slate-100 bg-slate-50/30 -mx-6 px-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                    {selectedInquiry.fullName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{selectedInquiry.fullName}</p>
                    <p className="text-xs text-slate-500">{selectedInquiry.email}</p>
                  </div>
                </div>
                <div className="sm:ml-auto flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(selectedInquiry.createdAt)}
                </div>
              </div>

              {/* Original Message */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Message from User</p>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Existing Reply */}
              {selectedInquiry.adminReply && (
                <div>
                  <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-3">Your Reply</p>
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5">
                    <p className="text-sm text-blue-900 whitespace-pre-wrap leading-relaxed">{selectedInquiry.adminReply}</p>
                    {selectedInquiry.repliedAt && (
                      <div className="flex items-center gap-1.5 mt-3 text-xs text-blue-500/70 font-medium">
                        <Clock className="h-3 w-3" />
                        Sent on {formatDate(selectedInquiry.repliedAt)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status Updater */}
              <div className="pt-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Update Status</p>
                <div className="flex gap-2 flex-wrap">
                  {["OPEN", "IN_PROGRESS", "RESOLVED"].map((s) => (
                    <Button
                      key={s}
                      variant={selectedInquiry.status === s ? "default" : "outline"}
                      size="sm"
                      disabled={isUpdatingStatus || selectedInquiry.status === s}
                      onClick={() => handleStatusChange(selectedInquiry.id, s)}
                      className={`text-xs h-8 px-4 rounded-lg transition-colors ${
                        selectedInquiry.status === s
                          ? "bg-slate-900 text-white hover:bg-slate-800"
                          : "border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      {STATUS_CONFIG[s].label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Reply Box */}
              {!selectedInquiry.adminReply && (
                <div className="pt-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Send a Reply</p>
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Type your response here. This will be sent as an email to the user..."
                      className="min-h-[140px] resize-none rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      maxLength={5000}
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-medium text-slate-400">{replyText.length} / 5000</p>
                      <Button
                        onClick={handleReply}
                        disabled={isReplying || !replyText.trim() || replyText.trim().length < 5}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-2 px-6 h-9 rounded-lg"
                      >
                        {isReplying ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5" />
                            Send Email Reply
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
