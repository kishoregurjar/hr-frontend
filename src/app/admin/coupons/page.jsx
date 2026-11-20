"use client";

import { useState, useEffect, Suspense } from "react";
import {
  Tag,
  Plus,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Edit2,
  Trash2,
  TrendingUp,
  Percent,
  CircleDollarSign,
  Repeat,
  Sparkles,
  Search,
  Eye,
  Calendar,
  AlertTriangle,
  Building2,
  ShieldCheck,
  Check,
  Copy,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Clock,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  getAdminCoupons,
  createAdminCoupon,
  updateAdminCoupon,
  toggleAdminCouponStatus,
  deleteAdminCoupon,
  getAdminCouponReports,
  getAdminCouponById,
} from "@/lib/api/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function AdminCouponsContent() {
  const [coupons, setCoupons] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination & Server filtering
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCouponsCount, setTotalCouponsCount] = useState(0);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [applicabilityFilter, setApplicabilityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCouponId, setCurrentCouponId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Redemptions Audit Modal
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [selectedCouponDetails, setSelectedCouponDetails] = useState(null);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Delete confirm modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const initialFormState = {
    code: "",
    name: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: 20,
    maxDiscountAmount: "",
    applicability: "FIRST_PURCHASE",
    applicablePlans: ["STARTER", "GROWTH", "BUSINESS"],
    applicableCycles: ["MONTHLY", "YEARLY"],
    validFrom: "",
    validUntil: "",
    maxRedemptions: "",
    perCompanyLimit: 1,
    isActive: true,
    showOnPricingPage: false,
    publicDescription: "",
    displayPriority: 0,
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async (currentPage = page) => {
    try {
      const [couponsRes, reportsRes] = await Promise.all([
        getAdminCoupons({
          page: currentPage,
          limit,
          search: searchQuery.trim() || undefined,
          applicability: applicabilityFilter !== "ALL" ? applicabilityFilter : undefined,
          isActive: statusFilter !== "ALL" ? (statusFilter === "ACTIVE" ? true : false) : undefined,
        }),
        getAdminCouponReports().catch(() => null),
      ]);

      const list = couponsRes?.coupons || (Array.isArray(couponsRes) ? couponsRes : []);
      setCoupons(list);
      setTotalCouponsCount(couponsRes?.total ?? list.length);
      setTotalPages(couponsRes?.totalPages ?? Math.max(1, Math.ceil((couponsRes?.total ?? list.length) / limit)));
      if (reportsRes) setReports(reportsRes);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load coupons.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchData(1);
  }, [applicabilityFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setRefreshing(true);
    fetchData(1);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setApplicabilityFilter("ALL");
    setStatusFilter("ALL");
    setPage(1);
    setRefreshing(true);
    getAdminCoupons({ page: 1, limit })
      .then((res) => {
        const list = res?.coupons || (Array.isArray(res) ? res : []);
        setCoupons(list);
        setTotalCouponsCount(res?.total ?? list.length);
        setTotalPages(res?.totalPages ?? 1);
      })
      .catch(() => {})
      .finally(() => setRefreshing(false));
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    fetchData(newPage);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(page);
  };

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setCurrentCouponId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coupon) => {
    setIsEditMode(true);
    setCurrentCouponId(coupon.id);
    setFormData({
      code: coupon.code,
      name: coupon.name || "",
      description: coupon.description || "",
      discountType: coupon.discountType || "PERCENTAGE",
      discountValue: coupon.discountValue,
      maxDiscountAmount: coupon.maxDiscountAmount !== null && coupon.maxDiscountAmount !== undefined ? coupon.maxDiscountAmount : "",
      applicability: coupon.applicability || "FIRST_PURCHASE",
      applicablePlans: coupon.applicablePlans || ["STARTER", "GROWTH", "BUSINESS"],
      applicableCycles: coupon.applicableCycles || ["MONTHLY", "YEARLY"],
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().slice(0, 16) : "",
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().slice(0, 16) : "",
      maxRedemptions: coupon.maxRedemptions !== null && coupon.maxRedemptions !== undefined ? coupon.maxRedemptions : "",
      perCompanyLimit: coupon.perCompanyLimit || 1,
      isActive: coupon.isActive,
      showOnPricingPage: coupon.showOnPricingPage ?? false,
      publicDescription: coupon.publicDescription || "",
      displayPriority: coupon.displayPriority ?? 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenAuditModal = async (coupon) => {
    setLoadingAudit(true);
    setAuditModalOpen(true);
    try {
      const data = await getAdminCouponById(coupon.id);
      setSelectedCouponDetails(data);
    } catch (err) {
      toast.error("Failed to load coupon redemptions audit.");
    } finally {
      setLoadingAudit(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.error("Coupon code is required.");
      return;
    }
    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      toast.error("Please provide a valid discount value greater than 0.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim() || formData.code.trim().toUpperCase(),
        description: formData.description.trim() || undefined,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        maxDiscountAmount: formData.maxDiscountAmount !== "" ? Number(formData.maxDiscountAmount) : null,
        applicability: formData.applicability,
        applicablePlans: formData.applicablePlans,
        applicableCycles: formData.applicableCycles,
        validFrom: formData.validFrom ? new Date(formData.validFrom).toISOString() : null,
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
        maxRedemptions: formData.maxRedemptions !== "" ? parseInt(formData.maxRedemptions, 10) : null,
        perCompanyLimit: formData.perCompanyLimit !== "" ? parseInt(formData.perCompanyLimit, 10) : 1,
        isActive: formData.isActive,
        showOnPricingPage: Boolean(formData.showOnPricingPage),
        publicDescription: formData.publicDescription.trim() || null,
        displayPriority: formData.displayPriority !== "" ? parseInt(formData.displayPriority, 10) : 0,
      };

      if (isEditMode) {
        await updateAdminCoupon(currentCouponId, payload);
        toast.success(`Coupon ${payload.code} updated successfully.`);
      } else {
        await createAdminCoupon(payload);
        toast.success(`Coupon ${payload.code} created successfully.`);
      }

      setIsModalOpen(false);
      fetchData(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save coupon.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (coupon) => {
    try {
      const newStatus = !coupon.isActive;
      await toggleAdminCouponStatus(coupon.id, newStatus);
      toast.success(`Coupon ${coupon.code} is now ${newStatus ? "Active" : "Inactive"}.`);
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, isActive: newStatus } : c))
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to toggle status.");
    }
  };

  const handleDeleteCoupon = async () => {
    if (!couponToDelete) return;
    setDeleting(true);
    try {
      await deleteAdminCoupon(couponToDelete.id);
      toast.success(`Coupon ${couponToDelete.code} removed.`);
      setDeleteModalOpen(false);
      setCouponToDelete(null);
      fetchData(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete coupon.");
    } finally {
      setDeleting(false);
    }
  };

  const copyToClipboard = (text) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success(`Copied "${text}" to clipboard!`);
    }
  };

  const isFiltersActive = searchQuery.trim() !== "" || applicabilityFilter !== "ALL" || statusFilter !== "ALL";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <AdminHeader
        title="Discount Coupons & Promotions"
        subtitle="Configure first-purchase and recurring renewal coupons, monitor usage limits and audit redemptions."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2 bg-white shadow-xs hover:bg-slate-50 text-slate-700"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
              Sync
            </Button>
            <Button
              size="sm"
              onClick={handleOpenCreateModal}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              Create Coupon
            </Button>
          </div>
        }
      />

      <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* ── KPI Reporting Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Coupons
              </span>
              <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Tag className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-slate-900">
                {reports?.totalCoupons ?? totalCouponsCount}
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                {reports?.activeCoupons ?? coupons.filter((c) => c.isActive).length} active promotions
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Discounted Payments
              </span>
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-slate-900">
                {reports?.successfulDiscountedPayments ?? 0}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                <span className="text-blue-600 font-medium">
                  {reports?.firstPurchaseRedemptions ?? 0} First-time
                </span>
                <span>•</span>
                <span className="text-indigo-600 font-medium">
                  {reports?.renewalRedemptions ?? 0} Renewals
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Discount Granted
              </span>
              <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Percent className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-purple-600">
                ₹{(reports?.totalDiscountGranted ?? 0).toLocaleString("en-IN")}
              </div>
              <p className="text-xs text-slate-500 mt-1">Total savings passed to customers</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Revenue Post-Discounts
              </span>
              <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <CircleDollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-slate-900">
                ₹{(reports?.netRevenueCollectedAfterDiscounts ?? 0).toLocaleString("en-IN")}
              </div>
              <p className="text-xs text-slate-500 mt-1">Verified gross captured revenue</p>
            </div>
          </div>
        </div>

        {/* ── Coupons Management Section with Action Header ── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Action Toolbar */}
          <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/40">
            <div className="flex items-center justify-between sm:justify-start gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Tag className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    All Promotional Coupons
                  </h3>
                  <p className="text-xs text-slate-500">
                    Create multiple coupons for targeted campaigns, new signups, or recurring renewals.
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 ml-1">
                {totalCouponsCount} {totalCouponsCount === 1 ? "Coupon" : "Coupons"}
              </Badge>
            </div>

            {/* Prominent "+ Create Coupon" Button right here */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleOpenCreateModal}
                className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
              >
                <Plus className="h-4 w-4" />
                Create New Coupon
              </Button>
            </div>
          </div>

          {/* Filters & Search Sub-bar */}
          <div className="p-4 border-b border-slate-100 bg-white flex flex-col md:flex-row items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search coupon code or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs bg-slate-50/70 border-slate-200 focus:bg-white"
              />
            </form>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start md:justify-end">
              {/* Applicability Filter */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="font-medium">Rule:</span>
                <select
                  value={applicabilityFilter}
                  onChange={(e) => setApplicabilityFilter(e.target.value)}
                  className="h-8 text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                >
                  <option value="ALL">All Applicability</option>
                  <option value="FIRST_PURCHASE">First Purchase Only</option>
                  <option value="EVERY_RENEWAL">Every Renewal</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="font-medium">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-8 text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="INACTIVE">Inactive Only</option>
                </select>
              </div>

              {isFiltersActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-8 px-2 text-xs text-slate-500 hover:text-slate-900 gap-1"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* ── Coupons Catalog Table ── */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              <p className="text-sm text-slate-500 font-medium">Loading coupon rules & redemptions...</p>
            </div>
          ) : coupons.length === 0 ? (
            <div className="py-20 text-center px-4">
              <Tag className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-900">No discount coupons found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                {isFiltersActive
                  ? "No coupons matched your filter criteria. Try clearing search or filters."
                  : "Create promotional discount codes for first-time subscriptions or recurring renewals."}
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                {isFiltersActive ? (
                  <Button variant="outline" size="sm" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                ) : (
                  <Button
                    onClick={handleOpenCreateModal}
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Create First Coupon
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Coupon Code & Details</th>
                    <th className="py-3 px-4">Discount</th>
                    <th className="py-3 px-4">Applicability</th>
                    <th className="py-3 px-4">Eligible Plans & Cycles</th>
                    <th className="py-3 px-4">Redemptions</th>
                    <th className="py-3 px-4">Financial Impact</th>
                    <th className="py-3 px-4">Capacity</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                  {coupons.map((coupon) => {
                    const isPercentage = coupon.discountType === "PERCENTAGE";
                    const isEveryRenewal = coupon.applicability === "EVERY_RENEWAL";
                    const totalLimit = coupon.maxRedemptions;
                    const used = coupon.redemptionCount || 0;
                    const remaining =
                      coupon.remainingCapacity !== null && coupon.remainingCapacity !== undefined
                        ? coupon.remainingCapacity
                        : totalLimit !== null && totalLimit !== undefined
                        ? Math.max(0, totalLimit - used)
                        : "∞";

                    const firstPurchaseCount = coupon.firstPurchaseRedemptions ?? 0;
                    const renewalCount = coupon.renewalRedemptions ?? 0;
                    const totalDiscount = coupon.totalDiscountGranted ?? 0;
                    const netRevenue = coupon.totalRevenueCollected ?? 0;
                    const statusKey = coupon.computedStatus || (coupon.isActive ? "ACTIVE" : "DISABLED");

                    return (
                      <tr key={coupon.id} className="hover:bg-slate-50/75 transition-colors">
                        {/* Coupon Code & Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md text-xs tracking-wider border border-slate-200">
                              {coupon.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(coupon.code)}
                              className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
                              title="Copy Code"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          {coupon.name && (
                            <p className="text-xs text-slate-600 mt-1 font-medium truncate max-w-xs">
                              {coupon.name}
                            </p>
                          )}
                          {coupon.validUntil ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                              <Calendar className="h-3 w-3" />
                              Expires {new Date(coupon.validUntil).toLocaleDateString("en-IN")}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 mt-0.5 block">No expiration</span>
                          )}
                          <div className="flex items-center gap-1.5 mt-1">
                            {coupon.showOnPricingPage ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full" title={coupon.publicDescription || "Visible on Pricing Page"}>
                                <Sparkles className="h-2.5 w-2.5" />
                                Public Offer {coupon.displayPriority ? `(P:${coupon.displayPriority})` : ""}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">
                                Private (Direct Code Only)
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Discount */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 text-xs">
                            {isPercentage ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} FLAT`}
                          </div>
                          {isPercentage && coupon.maxDiscountAmount ? (
                            <span className="text-[11px] text-slate-500 block">
                              Cap: ₹{coupon.maxDiscountAmount}
                            </span>
                          ) : null}
                        </td>

                        {/* Applicability */}
                        <td className="py-3.5 px-4">
                          {isEveryRenewal ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <Repeat className="h-3 w-3" />
                              Every Renewal
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <Sparkles className="h-3 w-3" />
                              First Purchase Only
                            </span>
                          )}
                        </td>

                        {/* Eligible Plans & Cycles */}
                        <td className="py-3.5 px-4">
                          <div className="text-xs font-medium text-slate-800">
                            {Array.isArray(coupon.applicablePlans) && coupon.applicablePlans.length > 0
                              ? coupon.applicablePlans.join(", ")
                              : "All Plans"}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {Array.isArray(coupon.applicableCycles) && coupon.applicableCycles.length > 0
                              ? coupon.applicableCycles.join(" & ")
                              : "All Cycles"}
                          </div>
                        </td>

                        {/* Redemptions Breakdown */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                            <span>{used} Total</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 text-[11px]">
                            <span className="text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded font-medium">
                              {firstPurchaseCount} 1st
                            </span>
                            <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded font-medium">
                              {renewalCount} renew
                            </span>
                          </div>
                        </td>

                        {/* Financial Impact */}
                        <td className="py-3.5 px-4">
                          <div className="text-xs text-purple-600 font-semibold">
                            -₹{totalDiscount.toLocaleString("en-IN")}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Rev: ₹{netRevenue.toLocaleString("en-IN")}
                          </div>
                        </td>

                        {/* Capacity Remaining */}
                        <td className="py-3.5 px-4">
                          <div className="text-xs font-semibold text-slate-900">
                            {remaining === "∞" ? "Unlimited" : `${remaining} left`}
                          </div>
                          <span className="text-[11px] text-slate-400 block">
                            {coupon.perCompanyLimit ? `${coupon.perCompanyLimit}x / co` : "No co limit"}
                          </span>
                        </td>

                        {/* Status with Toggle */}
                        <td className="py-3.5 px-4 text-center">
                          {statusKey === "EXPIRED" ? (
                            <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]">
                              Expired
                            </Badge>
                          ) : statusKey === "LIMIT_REACHED" ? (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                              Limit Reached
                            </Badge>
                          ) : statusKey === "SCHEDULED" ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                              Scheduled
                            </Badge>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(coupon)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                                coupon.isActive
                                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                              }`}
                              title={coupon.isActive ? "Click to deactivate coupon" : "Click to activate coupon"}
                            >
                              {coupon.isActive ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3" /> Active
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3" /> Paused
                                </>
                              )}
                            </button>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenAuditModal(coupon)}
                              className="h-7 w-7 p-0 text-slate-500 hover:text-blue-600"
                              title="View Redemptions Audit"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditModal(coupon)}
                              className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900"
                              title="Edit Coupon"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCouponToDelete(coupon);
                                setDeleteModalOpen(true);
                              }}
                              className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
                              title="Delete Coupon"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Pagination Controls ── */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Showing <strong className="text-slate-800">{(page - 1) * limit + 1}</strong> to{" "}
                <strong className="text-slate-800">
                  {Math.min(page * limit, totalCouponsCount)}
                </strong>{" "}
                of <strong className="text-slate-800">{totalCouponsCount}</strong> coupons
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="h-8 px-2.5 text-xs bg-white text-slate-700 border-slate-200"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                  Prev
                </Button>
                <span className="px-2 text-xs font-semibold text-slate-700">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="h-8 px-2.5 text-xs bg-white text-slate-700 border-slate-200"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Create / Edit Coupon Modal ── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Tag className="h-5 w-5 text-blue-600" />
              {isEditMode ? `Edit Coupon: ${formData.code}` : "Create New Discount Coupon"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Configure discount mechanics, eligibility rules, and whether the discount applies strictly to first purchases or carries over to every renewal.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
            {/* Coupon Code & Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Coupon Code *</Label>
                <Input
                  required
                  placeholder="e.g. WELCOME20"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="font-mono uppercase text-sm mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Display Name / Title</Label>
                <Input
                  placeholder="e.g. Early Bird 20% Off"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-sm mt-1"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label className="text-xs font-semibold text-slate-700">Internal Description / Notes</Label>
              <Input
                placeholder="Target campaign, marketing source or partner notes..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="text-sm mt-1"
              />
            </div>

            {/* Applicability: FIRST_PURCHASE vs EVERY_RENEWAL */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
              <Label className="text-xs font-bold text-slate-800 block">
                Coupon Applicability Rule *
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label
                  className={`flex flex-col p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.applicability === "FIRST_PURCHASE"
                      ? "border-amber-400 bg-amber-50/60 ring-1 ring-amber-400"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="applicability"
                      value="FIRST_PURCHASE"
                      checked={formData.applicability === "FIRST_PURCHASE"}
                      onChange={() => setFormData({ ...formData, applicability: "FIRST_PURCHASE" })}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-xs font-bold text-slate-900">FIRST_PURCHASE</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 pl-5">
                    Applies strictly to first-time paid purchase. Automatically excluded from subsequent renewals.
                  </p>
                </label>

                <label
                  className={`flex flex-col p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.applicability === "EVERY_RENEWAL"
                      ? "border-indigo-400 bg-indigo-50/60 ring-1 ring-indigo-400"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="applicability"
                      value="EVERY_RENEWAL"
                      checked={formData.applicability === "EVERY_RENEWAL"}
                      onChange={() => setFormData({ ...formData, applicability: "EVERY_RENEWAL" })}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-bold text-slate-900">EVERY_RENEWAL</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 pl-5">
                    Applies to initial purchase and automatically retained on every subsequent eligible renewal.
                  </p>
                </label>
              </div>
            </div>

            {/* Discount Mechanics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Discount Type</Label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (₹)</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  {formData.discountType === "PERCENTAGE" ? "Discount Percentage (%)" : "Flat Amount (₹)"} *
                </Label>
                <Input
                  required
                  type="number"
                  min="1"
                  max={formData.discountType === "PERCENTAGE" ? "100" : undefined}
                  step="0.01"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  className="text-sm mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Max Discount Cap (₹)</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Optional limit"
                  disabled={formData.discountType === "FIXED"}
                  value={formData.maxDiscountAmount}
                  onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                  className="text-sm mt-1"
                />
              </div>
            </div>

            {/* Applicable Plans & Cycles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700 block mb-1">
                  Applicable Plans
                </Label>
                <div className="flex flex-wrap gap-2">
                  {["STARTER", "GROWTH", "BUSINESS"].map((p) => {
                    const checked = formData.applicablePlans.includes(p);
                    return (
                      <label
                        key={p}
                        className={`text-xs px-2.5 py-1 rounded-md border cursor-pointer font-medium transition-all ${
                          checked
                            ? "bg-blue-50 text-blue-700 border-blue-300"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={checked}
                          onChange={() => {
                            const newPlans = checked
                              ? formData.applicablePlans.filter((x) => x !== p)
                              : [...formData.applicablePlans, p];
                            setFormData({ ...formData, applicablePlans: newPlans });
                          }}
                        />
                        {p}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700 block mb-1">
                  Applicable Billing Cycles
                </Label>
                <div className="flex flex-wrap gap-2">
                  {["MONTHLY", "YEARLY"].map((c) => {
                    const checked = formData.applicableCycles.includes(c);
                    return (
                      <label
                        key={c}
                        className={`text-xs px-2.5 py-1 rounded-md border cursor-pointer font-medium transition-all ${
                          checked
                            ? "bg-blue-50 text-blue-700 border-blue-300"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={checked}
                          onChange={() => {
                            const newCycles = checked
                              ? formData.applicableCycles.filter((x) => x !== c)
                              : [...formData.applicableCycles, c];
                            setFormData({ ...formData, applicableCycles: newCycles });
                          }}
                        />
                        {c}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Validity Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Valid From (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Valid Until / Expiry</Label>
                <Input
                  type="datetime-local"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>
            </div>

            {/* Capacity & Per Company Limits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Total Redemption Capacity
                </Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Blank for unlimited"
                  value={formData.maxRedemptions}
                  onChange={(e) => setFormData({ ...formData, maxRedemptions: e.target.value })}
                  className="text-sm mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Per-Company Redemption Limit
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.perCompanyLimit}
                  onChange={(e) => setFormData({ ...formData, perCompanyLimit: e.target.value })}
                  className="text-sm mt-1"
                />
              </div>
            </div>

            {/* Active Switch */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActiveSwitch"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="isActiveSwitch" className="text-xs font-semibold text-slate-800 cursor-pointer">
                Coupon is Active & Redeemable by eligible customers
              </Label>
            </div>

            {/* Public Pricing Page Visibility Controls */}
            <div className="rounded-xl border border-blue-200/80 bg-blue-50/40 p-3.5 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showOnPricingPageSwitch"
                  checked={formData.showOnPricingPage}
                  onChange={(e) => setFormData({ ...formData, showOnPricingPage: e.target.checked })}
                  className="h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="showOnPricingPageSwitch" className="text-xs font-bold text-slate-900 cursor-pointer flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  Show discount publicly inside Plan Cards on Pricing Page
                </Label>
              </div>

              {formData.showOnPricingPage && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="sm:col-span-2">
                    <Label className="text-xs font-semibold text-slate-700">
                      Customer-Facing Promotion Description
                    </Label>
                    <Input
                      placeholder="e.g. Flat 50% discount on your first subscription purchase!"
                      value={formData.publicDescription}
                      onChange={(e) => setFormData({ ...formData, publicDescription: e.target.value })}
                      className="text-xs mt-1 bg-white"
                    />
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Promotional message shown to prospective buyers on the pricing page.
                    </p>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-slate-700">
                      Display Priority
                    </Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.displayPriority}
                      onChange={(e) => setFormData({ ...formData, displayPriority: e.target.value })}
                      className="text-xs mt-1 bg-white"
                    />
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Higher numbers appear first.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-semibold"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEditMode ? "Save Changes" : "Create Coupon"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Redemptions Audit Modal ── */}
      <Dialog open={auditModalOpen} onOpenChange={setAuditModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              Redemptions Audit: {selectedCouponDetails?.code}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Verified atomic usage records, customer payments and discount deductions.
            </DialogDescription>
          </DialogHeader>

          {(() => {
            const redemptionsList =
              selectedCouponDetails?.redemptions ||
              selectedCouponDetails?.recentRedemptions ||
              [];

            if (loadingAudit) {
              return (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-7 w-7 text-blue-600 animate-spin" />
                  <p className="text-xs text-slate-500">Loading audit history...</p>
                </div>
              );
            }

            if (redemptionsList.length === 0) {
              return (
                <div className="py-12 text-center text-slate-500">
                  <Tag className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No redemptions yet</p>
                  <p className="text-xs text-slate-500 mt-1">
                    This coupon has not been applied to any completed subscription payments.
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span>
                    Total Redemptions: <strong className="text-slate-900">{redemptionsList.length}</strong>
                  </span>
                  <span>
                    Redemption Limit: <strong className="text-slate-900">{selectedCouponDetails.maxRedemptions ?? "Unlimited"}</strong>
                  </span>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {redemptionsList.map((redemption) => {
                    const companyTitle =
                      redemption.companyName ||
                      redemption.company?.name ||
                      "Company Workspace";
                    const dateVal =
                      redemption.redeemedAt ||
                      redemption.createdAt ||
                      new Date();

                    return (
                      <div
                        key={redemption.id}
                        className="p-3.5 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">
                              {companyTitle}
                            </span>
                            <Badge
                              variant="outline"
                              className={
                                redemption.redemptionType === "RENEWAL"
                                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }
                            >
                              {redemption.redemptionType}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Redeemed on {new Date(dateVal).toLocaleString("en-IN")}
                          </p>
                        </div>

                        <div className="text-right sm:text-right w-full sm:w-auto">
                          <div className="text-slate-400 line-through text-[11px]">
                            ₹{Number(redemption.originalAmount).toLocaleString("en-IN")}
                          </div>
                          <div className="font-bold text-emerald-600 text-sm">
                            Paid ₹{Number(redemption.finalAmount).toLocaleString("en-IN")}{" "}
                            <span className="font-normal text-xs text-purple-600">
                              (-₹{Number(redemption.discountAmount).toLocaleString("en-IN")})
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          <DialogFooter className="pt-3 border-t border-slate-100">
            <Button size="sm" variant="outline" onClick={() => setAuditModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Modal ── */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
              Delete Promotion Coupon?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Are you sure you want to permanently remove coupon{" "}
              <strong className="text-slate-800">{couponToDelete?.code}</strong>? If this coupon has existing completed payments, it will be safely deactivated instead to protect financial audit trails.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteCoupon}
              disabled={deleting}
              className="gap-2 bg-rose-600 hover:bg-rose-700 text-white"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete Coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminCouponsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      }
    >
      <AdminCouponsContent />
    </Suspense>
  );
}
