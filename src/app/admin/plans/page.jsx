"use client";

import { useState, useEffect, Suspense } from "react";
import {
  CreditCard,
  Plus,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Edit2,
  Trash2,
  Users,
  Send,
  UserCheck,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  getAdminPlans,
  createAdminPlan,
  updateAdminPlan,
  toggleAdminPlanStatus,
  deleteAdminPlan,
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

function AdminPlansContent() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete confirm modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const initialFormState = {
    name: "",
    code: "",
    description: "",
    monthlyPrice: 0,
    yearlyPrice: 0,
    seatLimit: 2,
    candidateLimit: 100,
    inviteLimit: 50,
    durationDays: 30,
    isTrial: false,
    isCustom: false,
    isActive: true,
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchPlans = async () => {
    try {
      const data = await getAdminPlans();
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load SaaS plans catalog.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPlans();
  };

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setCurrentPlanId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (plan) => {
    setIsEditMode(true);
    setCurrentPlanId(plan.id);
    setFormData({
      name: plan.name || "",
      code: plan.code || "",
      description: plan.description || "",
      monthlyPrice: Number(plan.monthlyPrice) || 0,
      yearlyPrice: Number(plan.yearlyPrice) || 0,
      seatLimit: Number(plan.seatLimit) || 0,
      candidateLimit: Number(plan.candidateLimit) || 0,
      inviteLimit: Number(plan.inviteLimit) || 0,
      durationDays: Number(plan.durationDays) || 30,
      isTrial: Boolean(plan.isTrial),
      isCustom: Boolean(plan.isCustom),
      isActive: Boolean(plan.isActive),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Plan name is required");
      return;
    }
    if (!isEditMode && !formData.code.trim()) {
      toast.error("Plan code is required");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode) {
        await updateAdminPlan(currentPlanId, {
          name: formData.name.trim(),
          description: formData.description?.trim(),
          monthlyPrice: Number(formData.monthlyPrice),
          yearlyPrice: Number(formData.yearlyPrice),
          seatLimit: Number(formData.seatLimit),
          candidateLimit: Number(formData.candidateLimit),
          inviteLimit: Number(formData.inviteLimit),
          durationDays: Number(formData.durationDays),
          isActive: formData.isActive,
        });
        toast.success("Plan updated successfully. Existing subscribers keep their original snapshot.");
      } else {
        await createAdminPlan({
          ...formData,
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          description: formData.description?.trim(),
          monthlyPrice: Number(formData.monthlyPrice),
          yearlyPrice: Number(formData.yearlyPrice),
          seatLimit: Number(formData.seatLimit),
          candidateLimit: Number(formData.candidateLimit),
          inviteLimit: Number(formData.inviteLimit),
          durationDays: Number(formData.durationDays),
        });
        toast.success("New SaaS plan added successfully!");
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Operation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (plan) => {
    try {
      const updatedStatus = !plan.isActive;
      await toggleAdminPlanStatus(plan.id, updatedStatus);
      toast.success(`Plan "${plan.name}" ${updatedStatus ? "activated" : "deactivated"}.`);
      fetchPlans();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update plan status.");
    }
  };

  const handleDelete = async () => {
    if (!planToDelete) return;
    setDeleting(true);
    try {
      await deleteAdminPlan(planToDelete.id);
      toast.success(`Plan "${planToDelete.name}" deleted.`);
      setDeleteModalOpen(false);
      setPlanToDelete(null);
      fetchPlans();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Cannot delete plan that has subscribers.");
    } finally {
      setDeleting(false);
    }
  };

  const totalSubscribers = plans.reduce(
    (acc, p) => acc + (p.subscriberCount ?? p.activeSubscribers ?? 0),
    0
  );
  const activePlansCount = plans.filter((p) => p.isActive).length;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 font-sans">
      <AdminHeader
        title="SaaS Plans & Dynamic Pricing"
        subtitle="Manage platform subscription tiers, quotas, monthly & yearly pricing, and trial rules"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "SaaS Plans", href: "/admin/plans" },
        ]}
      />

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* ── Metric Highlights ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Plans</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{plans.length}</h3>
              <p className="text-xs text-slate-400 mt-1">Configured subscription tiers</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Plans</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{activePlansCount}</h3>
              <p className="text-xs text-slate-400 mt-1">Visible to companies for purchase</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Subscriptions</p>
              <h3 className="text-2xl font-bold text-indigo-600 mt-1">{totalSubscribers}</h3>
              <p className="text-xs text-slate-400 mt-1">Subscribed companies</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* ── Action Bar ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Subscription Tiers</h2>
            <Badge variant="outline" className="text-xs bg-slate-50 border-slate-300">
              Only 3 limits enforced: Seats, Candidates, Monthly Invites
            </Badge>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2 border-slate-200"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              onClick={handleOpenCreateModal}
              size="sm"
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Create Plan
            </Button>
          </div>
        </div>

        {/* ── Plans Table / Grid ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200/80">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <p className="text-sm text-slate-500 mt-3">Loading SaaS plan configurations...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl border border-slate-200/80">
            <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No subscription plans found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
              Create your first subscription tier to start offering paid plans to companies.
            </p>
            <Button onClick={handleOpenCreateModal} className="mt-4 gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Create First Plan
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/75 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Plan Details</th>
                    <th className="py-3.5 px-4">Pricing</th>
                    <th className="py-3.5 px-4">Active HR Seats</th>
                    <th className="py-3.5 px-4">Candidate Quota</th>
                    <th className="py-3.5 px-4">Monthly Invites</th>
                    <th className="py-3.5 px-4">Subscribers</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {plans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-base">{plan.name}</span>
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                            {plan.code}
                          </span>
                          {plan.isTrial && (
                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none text-[10px]">
                              Free Trial
                            </Badge>
                          )}
                          {plan.isCustom && (
                            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-none text-[10px]">
                              Custom
                            </Badge>
                          )}
                        </div>
                        {plan.description && (
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{plan.description}</p>
                        )}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">
                          {plan.monthlyPrice === 0 ? "Free" : `₹${Number(plan.monthlyPrice).toLocaleString("en-IN")}/mo`}
                        </div>
                        {plan.yearlyPrice > 0 && (
                          <div className="text-xs text-emerald-600 font-medium">
                            ₹{Number(plan.yearlyPrice).toLocaleString("en-IN")}/yr
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <UserCheck className="h-4 w-4 text-slate-400" />
                          <span>{plan.seatLimit} seats</span>
                        </div>
                        <span className="text-[11px] text-slate-400">(Owner free)</span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <Users className="h-4 w-4 text-slate-400" />
                          <span>{Number(plan.candidateLimit).toLocaleString()} lifetime</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <Send className="h-4 w-4 text-slate-400" />
                          <span>{Number(plan.inviteLimit).toLocaleString()} / month</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap font-medium text-slate-700">
                        {(() => {
                          const count = plan.subscriberCount ?? plan.activeSubscribers ?? 0;
                          return (
                            <div className="flex flex-col gap-1 items-start">
                              <Badge
                                variant="secondary"
                                className={
                                  count > 0
                                    ? "bg-indigo-100 text-indigo-800 font-bold border-indigo-200"
                                    : "bg-slate-100 text-slate-600 font-medium border-slate-200"
                                }
                              >
                                {count} {count === 1 ? "company" : "companies"}
                              </Badge>
                              {Array.isArray(plan.subscriberCompanies) && plan.subscriberCompanies.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1 mt-0.5 max-w-[200px]">
                                  {plan.subscriberCompanies.map((c) => (
                                    <span
                                      key={c.id || c.slug}
                                      className="inline-flex items-center text-[11px] font-semibold text-indigo-900 bg-indigo-50/80 px-2 py-0.5 rounded border border-indigo-200/60"
                                    >
                                      {c.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(plan)}
                          className="flex items-center gap-1.5 group cursor-pointer focus:outline-none"
                          title="Click to toggle active status"
                        >
                          {plan.isActive ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 group-hover:bg-emerald-200">
                              <CheckCircle2 className="h-3 w-3" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-slate-200">
                              <XCircle className="h-3 w-3" /> Inactive
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditModal(plan)}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600"
                            title="Edit Plan"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setPlanToDelete(plan);
                              setDeleteModalOpen(true);
                            }}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600"
                            title="Delete Plan"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ── Create / Edit Modal ── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              {isEditMode ? `Edit Plan: ${formData.name}` : "Create New SaaS Plan"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {isEditMode
                ? "Changes will strictly apply to new subscriptions and future renewals. Existing active subscriber snapshots are untouched."
                : "Add a new plan tier with pricing and enforce the three SaaS quotas."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="plan-name" className="text-xs font-semibold text-slate-700">
                  Plan Display Name *
                </Label>
                <Input
                  id="plan-name"
                  placeholder="e.g. Growth Pro"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="plan-code" className="text-xs font-semibold text-slate-700">
                  Plan Code (Uppercase identifier) *
                </Label>
                <Input
                  id="plan-code"
                  placeholder="e.g. GROWTH_PRO"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="mt-1 font-mono uppercase"
                  disabled={isEditMode}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="plan-desc" className="text-xs font-semibold text-slate-700">
                Description
              </Label>
              <Input
                id="plan-desc"
                placeholder="Target audience or key benefits"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1"
              />
            </div>

            {/* Pricing Section */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                Pricing (INR ₹)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="plan-monthly" className="text-xs font-semibold text-slate-700">
                    Monthly Price (₹)
                  </Label>
                  <Input
                    id="plan-monthly"
                    type="number"
                    min="0"
                    placeholder="999"
                    value={formData.monthlyPrice}
                    onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="plan-yearly" className="text-xs font-semibold text-slate-700">
                    Yearly Price (₹)
                  </Label>
                  <Input
                    id="plan-yearly"
                    type="number"
                    min="0"
                    placeholder="9990"
                    value={formData.yearlyPrice}
                    onChange={(e) => setFormData({ ...formData, yearlyPrice: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Quotas Section */}
            <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block">
                  Enforced Quotas (Strict 3 Limits Only)
                </span>
                <span className="text-[11px] text-blue-700 font-medium">All features accessible</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="plan-seats" className="text-xs font-semibold text-slate-700">
                    Active HR Seats
                  </Label>
                  <Input
                    id="plan-seats"
                    type="number"
                    min="1"
                    placeholder="5"
                    value={formData.seatLimit}
                    onChange={(e) => setFormData({ ...formData, seatLimit: e.target.value })}
                    className="mt-1 bg-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Admin + Recruiter count</p>
                </div>

                <div>
                  <Label htmlFor="plan-cands" className="text-xs font-semibold text-slate-700">
                    Lifetime Candidates
                  </Label>
                  <Input
                    id="plan-cands"
                    type="number"
                    min="1"
                    placeholder="1000"
                    value={formData.candidateLimit}
                    onChange={(e) => setFormData({ ...formData, candidateLimit: e.target.value })}
                    className="mt-1 bg-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Total in talent pool</p>
                </div>

                <div>
                  <Label htmlFor="plan-invites" className="text-xs font-semibold text-slate-700">
                    Monthly Invites
                  </Label>
                  <Input
                    id="plan-invites"
                    type="number"
                    min="1"
                    placeholder="300"
                    value={formData.inviteLimit}
                    onChange={(e) => setFormData({ ...formData, inviteLimit: e.target.value })}
                    className="mt-1 bg-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Assessment links/mo</p>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditMode ? "Save Changes" : "Create Plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Modal ── */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <ShieldAlert className="h-5 w-5" />
              Delete Plan Catalog Entry
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              Are you sure you want to permanently delete plan{" "}
              <strong className="text-slate-900">{planToDelete?.name}</strong>?
              <br />
              This action cannot be undone. Plans with active subscribers cannot be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm focus:ring-rose-500"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin text-white" />}
              Delete Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminPlansPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      }
    >
      <AdminPlansContent />
    </Suspense>
  );
}

