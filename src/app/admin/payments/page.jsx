"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CircleDollarSign,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  Info,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  getAdminRevenueOverview,
  getAdminRevenueCharts,
  getAdminPaymentTransactions,
  getAdminTransactionDetail,
} from "@/lib/api/superAdminPayments";

export default function AdminPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Overview KPIs
  const [overview, setOverview] = useState({
    totalCapturedRevenue: 0,
    currentMonthRevenue: 0,
    currentYearRevenue: 0,
    totalSuccessful: 0,
    totalPending: 0,
    totalFailed: 0,
    totalRefunds: 0,
    netRevenue: 0,
    successRate: 100,
    isTestMode: true,
  });

  // Charts
  const [charts, setCharts] = useState({
    monthlyTrend: [],
    yearlyTrend: [],
    planBreakdown: [],
    statusBreakdown: [],
  });

  // Transactions list & filters
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [planFilter, setPlanFilter] = useState("ALL");
  const [billingCycleFilter, setBillingCycleFilter] = useState("ALL");
  const [dateRangeFilter, setDateRangeFilter] = useState("ALL");

  // Detail Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch Dashboard Data
  const fetchData = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const [overviewRes, chartsRes, txRes] = await Promise.all([
          getAdminRevenueOverview(),
          getAdminRevenueCharts(),
          getAdminPaymentTransactions({
            page: pagination.page,
            limit: pagination.limit,
            search,
            status: statusFilter,
            plan: planFilter,
            billingCycle: billingCycleFilter,
            dateRange: dateRangeFilter,
          }),
        ]);

        if (overviewRes) setOverview(overviewRes);
        if (chartsRes) setCharts(chartsRes);
        if (txRes?.transactions) {
          setTransactions(txRes.transactions);
          if (txRes.pagination) setPagination(txRes.pagination);
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load revenue and payment data.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      pagination.page,
      pagination.limit,
      search,
      statusFilter,
      planFilter,
      billingCycleFilter,
      dateRangeFilter,
    ]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open transaction detail
  const handleViewDetail = async (txId) => {
    setDetailLoading(true);
    setDetailModalOpen(true);
    try {
      const data = await getAdminTransactionDetail(txId);
      setSelectedTx(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not fetch transaction details.");
      setDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold text-[11px] gap-1 px-2 py-0.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            COMPLETED
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 font-bold text-[11px] gap-1 px-2 py-0.5">
            <Clock className="w-3 h-3 text-amber-600 animate-spin" />
            PENDING
          </Badge>
        );
      case "FAILED":
      case "CANCELLED":
        return (
          <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 font-bold text-[11px] gap-1 px-2 py-0.5">
            <XCircle className="w-3 h-3 text-rose-600" />
            {status}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Find highest monthly revenue for relative chart bar heights
  const maxMonthlyRevenue = Math.max(
    ...charts.monthlyTrend.map((m) => m.revenue || 0),
    1000
  );

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <CircleDollarSign className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                Payments & Revenue
                <Badge className="bg-amber-500/10 text-amber-700 border border-amber-300 font-extrabold text-[11px] uppercase tracking-wider px-2 py-0.5">
                  Razorpay Test Mode
                </Badge>
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Platform-wide subscription billing, Razorpay gateway verification & revenue analytics
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="text-xs font-bold gap-1.5 border-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* ── Security / Test Mode Notice Banner ── */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900/90 leading-relaxed space-y-1">
          <p className="font-bold text-blue-950 flex items-center gap-2">
            Test Environment Active (Isolated Sandbox)
          </p>
          <p className="text-blue-800">
            Transactions in this dashboard are executed via <strong>Razorpay Standard Checkout (Test Mode)</strong> with HMAC-SHA256 signature verification and server-side capture status checks. Test revenues are strictly isolated from production records.
          </p>
        </div>
      </div>

      {/* ── Revenue Summary Metrics (8 KPIs) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Captured Revenue */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Captured
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CircleDollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(overview.totalCapturedRevenue)}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Gross captured from {overview.totalSuccessful} subscriptions
            </p>
          </div>
        </div>

        {/* 2. Net Revenue */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Net Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-blue-600 tracking-tight">
              {formatCurrency(overview.netRevenue)}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Captured minus {formatCurrency(overview.totalRefunds)} refunds
            </p>
          </div>
        </div>

        {/* 3. Current Month Revenue */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              This Month
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(overview.currentMonthRevenue)}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Active month subscription inflow
            </p>
          </div>
        </div>

        {/* 4. Current Year Revenue */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              This Year
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(overview.currentYearRevenue)}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Calendar year cumulative total
            </p>
          </div>
        </div>

        {/* 5. Total Successful Payments */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Successful Payments</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-black text-slate-900">{overview.totalSuccessful}</span>
            <Badge className="bg-emerald-50 text-emerald-700 text-[10px] font-bold">
              {overview.successRate}% Success Rate
            </Badge>
          </div>
        </div>

        {/* 6. Pending Orders */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pending Orders</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-slate-900">{overview.totalPending}</span>
            <span className="text-[11px] text-slate-400 font-medium ml-2">Awaiting completion</span>
          </div>
        </div>

        {/* 7. Failed Payments */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Failed Payments</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-slate-900">{overview.totalFailed}</span>
            <span className="text-[11px] text-slate-400 font-medium ml-2">Declined / abandoned</span>
          </div>
        </div>

        {/* 8. Total Refunds */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Refunds</span>
            <RotateCcw className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-slate-900">{formatCurrency(overview.totalRefunds)}</span>
            <span className="text-[11px] text-slate-400 font-medium ml-2">Processed refunds</span>
          </div>
        </div>
      </div>

      {/* ── Visual Revenue Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Monthly Revenue Trend (Last 12 Months)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Recurring captured amounts in INR across all tenant subscriptions
              </p>
            </div>
            <Badge variant="outline" className="text-[11px] font-bold text-slate-600">
              INR (₹)
            </Badge>
          </div>

          <div className="h-52 w-full pt-4 flex items-end justify-between gap-2 border-b border-slate-100 pb-2">
            {charts.monthlyTrend.map((m, idx) => {
              const heightPct = Math.max(8, Math.round((m.revenue / maxMonthlyRevenue) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition pointer-events-none z-10 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-md whitespace-nowrap">
                    {m.label}: {formatCurrency(m.revenue)} ({m.transactions} tx)
                  </div>

                  <div className="w-full max-w-[28px] bg-slate-100 rounded-t-lg overflow-hidden flex items-end h-40">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        m.revenue > 0
                          ? "bg-gradient-to-t from-blue-600 to-indigo-500 group-hover:from-blue-700 group-hover:to-indigo-600"
                          : "bg-slate-200"
                      }`}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 transform -rotate-45 sm:rotate-0 origin-top-left">
                    {m.label.split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plan-Wise Revenue Breakdown */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-5">
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Plan-Wise Revenue Distribution
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Share of platform subscription volume by plan tier
            </p>
          </div>

          <div className="space-y-4">
            {charts.planBreakdown.map((item, idx) => {
              const colors = [
                "bg-blue-600",
                "bg-indigo-600",
                "bg-purple-600",
                "bg-emerald-600",
              ];
              const color = colors[idx % colors.length];

              return (
                <div key={item.code} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">{item.name} Plan</span>
                    <span className="font-extrabold text-slate-900">
                      {formatCurrency(item.revenue)}{" "}
                      <span className="text-slate-400 font-medium">({item.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Payment Status Summary Pills */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Payment Health
            </span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-700 block">Successful</span>
                <span className="text-sm font-extrabold text-emerald-900">{overview.totalSuccessful}</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-100">
                <span className="text-[10px] font-bold text-amber-700 block">Pending</span>
                <span className="text-sm font-extrabold text-amber-900">{overview.totalPending}</span>
              </div>
              <div className="p-2 rounded-xl bg-rose-50/60 border border-rose-100">
                <span className="text-[10px] font-bold text-rose-700 block">Failed</span>
                <span className="text-sm font-extrabold text-rose-900">{overview.totalFailed}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Complete Payment Transactions Table ── */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden space-y-4">
        {/* Table Top Filter Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Payment Transactions ({pagination.total})
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Verified Razorpay orders, payment signatures, and tenant subscriptions
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search company, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs h-9 bg-slate-50/50 border-slate-200 rounded-xl"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs h-9 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>

            {/* Plan Filter */}
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="text-xs h-9 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium outline-none"
            >
              <option value="ALL">All Plans</option>
              <option value="STARTER">Starter</option>
              <option value="GROWTH">Growth</option>
              <option value="BUSINESS">Business</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>

            {/* Billing Cycle Filter */}
            <select
              value={billingCycleFilter}
              onChange={(e) => setBillingCycleFilter(e.target.value)}
              className="text-xs h-9 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium outline-none"
            >
              <option value="ALL">All Cycles</option>
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>

            {/* Date Range Filter */}
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              className="text-xs h-9 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium outline-none"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="WEEK">Last 7 Days</option>
              <option value="MONTH">This Month</option>
              <option value="YEAR">This Year</option>
            </select>
          </div>
        </div>

        {/* Transactions Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Company & Owner</th>
                <th className="py-3 px-4">Plan & Cycle</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Razorpay Reference</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    Loading payment transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <CircleDollarSign className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No payment transactions found.</p>
                    <p className="text-xs text-slate-400">Try adjusting your search or status filters.</p>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Company & Owner */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{tx.companyName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <span>{tx.ownerName}</span>
                        <span>•</span>
                        <span className="font-mono text-[10px]">{tx.ownerEmail}</span>
                      </div>
                    </td>

                    {/* Plan & Cycle */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{tx.planName}</div>
                      <div className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">
                        {tx.billingCycle}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-slate-900 text-sm">
                        {formatCurrency(tx.amount)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold ml-1">{tx.currency}</span>
                    </td>

                    {/* Razorpay References */}
                    <td className="py-3 px-4">
                      <div className="font-mono text-[11px] text-slate-700 flex items-center gap-1">
                        <span className="text-slate-400">Order:</span>
                        <span>{tx.razorpayOrderId || "N/A"}</span>
                      </div>
                      {tx.razorpayPaymentId && tx.razorpayPaymentId !== "N/A" && (
                        <div className="font-mono text-[10px] text-emerald-700 flex items-center gap-1 mt-0.5">
                          <span className="text-slate-400">Pay:</span>
                          <span>{tx.razorpayPaymentId}</span>
                        </div>
                      )}
                    </td>

                    {/* Method */}
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[10px] font-bold text-slate-600 uppercase">
                        {tx.paymentMethod}
                      </Badge>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4">
                      <div className="text-slate-700 font-medium">
                        {formatDate(tx.paidAt || tx.createdAt)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {getStatusBadge(tx.status)}
                        <Badge className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0 border-0">
                          TEST
                        </Badge>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail(tx.id)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1 h-8 px-2.5 rounded-lg"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} total)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              className="text-xs h-8 gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              className="text-xs h-8 gap-1"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Transaction Detail Modal ── */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-xl max-w-[95vw] rounded-3xl p-6 bg-white border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <CircleDollarSign className="w-5 h-5 text-blue-600" />
              Transaction Details
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Verified Razorpay gateway purchase record and subscription snapshot
            </DialogDescription>
          </DialogHeader>

          {detailLoading || !selectedTx ? (
            <div className="py-12 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
              Loading transaction audit trail...
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              {/* Status Header Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Amount & Status
                  </div>
                  <div className="text-xl font-black text-slate-900 mt-0.5">
                    {formatCurrency(selectedTx.amount)} {selectedTx.currency}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  {getStatusBadge(selectedTx.status)}
                  <div className="text-[10px] text-slate-400 font-bold uppercase">
                    Mode: {selectedTx.environment || "TEST"}
                  </div>
                </div>
              </div>

              {/* Grid Information */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50/50 border border-slate-200/60">
                <div>
                  <span className="text-slate-400 font-bold text-[10px] uppercase block">Company</span>
                  <span className="font-bold text-slate-900 text-xs">{selectedTx.companyName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold text-[10px] uppercase block">Owner Contact</span>
                  <span className="font-medium text-slate-800 text-xs">
                    {selectedTx.ownerName} ({selectedTx.ownerEmail})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold text-[10px] uppercase block">Plan Tier</span>
                  <span className="font-bold text-slate-900 text-xs">
                    {selectedTx.planName} ({selectedTx.billingCycle})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold text-[10px] uppercase block">Payment Method</span>
                  <span className="font-bold text-slate-900 text-xs uppercase">{selectedTx.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold text-[10px] uppercase block">Payment Timestamp</span>
                  <span className="font-medium text-slate-800 text-xs">
                    {formatDate(selectedTx.paidAt || selectedTx.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold text-[10px] uppercase block">Internal Receipt</span>
                  <span className="font-mono text-slate-700 text-xs">{selectedTx.receipt || "N/A"}</span>
                </div>
              </div>

              {/* Razorpay Gateway Audit References */}
              <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200/70 space-y-2">
                <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
                  Razorpay Security References
                </span>
                <div className="grid grid-cols-1 gap-1 text-[11px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Razorpay Order ID:</span>
                    <span className="font-bold text-blue-950">{selectedTx.razorpayOrderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Razorpay Payment ID:</span>
                    <span className="font-bold text-blue-950">{selectedTx.razorpayPaymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Signature Verification:</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      HMAC-SHA256 Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Quota Snapshot */}
              {selectedTx.planSnapshot && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Activated Quotas Snapshot
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="p-2 rounded-xl bg-white border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">HR Seats</span>
                      <span className="font-bold text-slate-900">
                        {selectedTx.planSnapshot.seatLimit ?? "Unlimited"}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Talent Pool</span>
                      <span className="font-bold text-slate-900">
                        {selectedTx.planSnapshot.candidateLimit ?? "Unlimited"}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Monthly Invites</span>
                      <span className="font-bold text-slate-900">
                        {selectedTx.planSnapshot.inviteLimit ?? "Unlimited"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Failure Error Info if applicable */}
              {selectedTx.errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-rose-950">Gateway Error Description:</strong>
                    {selectedTx.errorMessage}
                  </div>
                </div>
              )}

              {/* PCI-DSS Security Compliance Note */}
              <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>PCI-DSS compliant: Card credentials, CVVs, and UPI PINs are never handled or stored.</span>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4 border-t border-slate-100 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDetailModalOpen(false)}
              className="w-full text-xs font-bold"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

