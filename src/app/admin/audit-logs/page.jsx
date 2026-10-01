"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Search,
  Filter,
  Calendar,
  Building2,
  User,
  Shield,
  Eye,
  X,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { getAuditLogs, getAdminCompanies } from "@/lib/api/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const ACTION_LABELS = {
  PLATFORM_ADMIN_INVITED: "Platform Admin Invited",
  PLATFORM_ADMIN_INVITATION_RESENT: "Platform Admin Invitation Resent",
  COMPANY_CREATED: "Company Created",
  COMPANY_UPDATED: "Company Updated",
  COMPANY_DELETED: "Company Deleted",
  COMPANY_STATUS_UPDATED: "Company Status Updated",
  COMPANY_LOGO_UPLOADED: "Company Logo Uploaded",
  COMPANY_LOGO_REMOVED: "Company Logo Removed",
  MEMBER_ROLE_UPDATED: "Member Role Updated",
  MEMBER_REMOVED: "Member Removed",
  OWNERSHIP_TRANSFERRED: "Ownership Transferred",
  OWNER_ACTIVATION_RESENT: "Owner Activation Resent",
  OWNER_ACTIVATION_REVOKED: "Owner Activation Revoked",
  INVITATION_CREATED: "Invitation Created",
  INVITATION_REVOKED: "Invitation Revoked",
  INVITATION_ACCEPTED: "Invitation Accepted",
  INVITATION_EXPIRED: "Invitation Expired",
};

const ACTION_COLORS = {
  PLATFORM_ADMIN_INVITED: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  PLATFORM_ADMIN_INVITATION_RESENT: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
  COMPANY_CREATED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  COMPANY_STATUS_UPDATED: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  OWNER_ACTIVATION_RESENT: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  OWNER_ACTIVATION_REVOKED: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800",
};

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [entityTypeFilter, setEntityTypeFilter] = useState("ALL");
  const [companyFilter, setCompanyFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Applied Filters (sent to API)
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    action: "ALL",
    entityType: "ALL",
    companyId: "ALL",
    dateFrom: "",
    dateTo: "",
  });

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Modal State
  const [selectedLog, setSelectedLog] = useState(null);

  // Load Companies for Dropdown Filter
  useEffect(() => {
    async function loadCompanies() {
      try {
        const list = await getAdminCompanies({ page: 1, limit: 100 });
        setCompanies(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Failed to load companies for filter:", err);
      }
    }
    loadCompanies();
  }, []);

  // Fetch Audit Logs Function
  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
      };

      if (appliedFilters.search.trim()) {
        params.search = appliedFilters.search.trim();
      }
      if (appliedFilters.action !== "ALL") {
        params.action = appliedFilters.action;
      }
      if (appliedFilters.entityType !== "ALL") {
        params.entityType = appliedFilters.entityType;
      }
      if (appliedFilters.companyId !== "ALL") {
        params.companyId = appliedFilters.companyId;
      }
      if (appliedFilters.dateFrom) {
        params.dateFrom = new Date(appliedFilters.dateFrom).toISOString();
      }
      if (appliedFilters.dateTo) {
        // Set end of day for dateTo
        const d = new Date(appliedFilters.dateTo);
        d.setHours(23, 59, 59, 999);
        params.dateTo = d.toISOString();
      }

      const response = await getAuditLogs(params);
      const items = Array.isArray(response?.items)
        ? response.items
        : Array.isArray(response?.data?.items)
        ? response.data.items
        : [];
      setLogs(items);

      const pag = response?.pagination || response?.data?.pagination;
      if (pag) {
        setPagination(pag);
      } else {
        setPagination({
          page,
          limit,
          total: items.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        });
      }
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
      setError(err?.response?.data?.message || err?.message || "Failed to load audit logs.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, appliedFilters]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const handleApplyFilters = () => {
    setAppliedFilters({
      search,
      action: actionFilter,
      entityType: entityTypeFilter,
      companyId: companyFilter,
      dateFrom,
      dateTo,
    });
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setActionFilter("ALL");
    setEntityTypeFilter("ALL");
    setCompanyFilter("ALL");
    setDateFrom("");
    setDateTo("");
    setAppliedFilters({
      search: "",
      action: "ALL",
      entityType: "ALL",
      companyId: "ALL",
      dateFrom: "",
      dateTo: "",
    });
    setPage(1);
  };

  const formatActionLabel = (action) => {
    if (ACTION_LABELS[action]) return ACTION_LABELS[action];
    return action
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const total = pagination.total || 0;
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 space-y-6">
      <AdminHeader
        title="Platform Audit Logs"
        subtitle="Platform-wide Super Admin activity, security events, and accountability audit trail"
      />

      {/* FILTERS CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-semibold text-sm">
            <Filter className="w-4 h-4 text-indigo-500" />
            <span>Filter Audit Logs</span>
          </div>
          {(appliedFilters.search ||
            appliedFilters.action !== "ALL" ||
            appliedFilters.entityType !== "ALL" ||
            appliedFilters.companyId !== "ALL" ||
            appliedFilters.dateFrom ||
            appliedFilters.dateTo) && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              Filters Active
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Search Text
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
                placeholder="Admin name, email, company..."
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Action Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Action
            </label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Actions</option>
              <option value="PLATFORM_ADMIN_INVITED">Platform Admin Invited</option>
              <option value="PLATFORM_ADMIN_INVITATION_RESENT">Platform Admin Invitation Resent</option>
              <option value="COMPANY_CREATED">Company Created</option>
              <option value="COMPANY_STATUS_UPDATED">Company Status Updated</option>
              <option value="OWNER_ACTIVATION_RESENT">Owner Activation Resent</option>
              <option value="OWNER_ACTIVATION_REVOKED">Owner Activation Revoked</option>
              <option value="COMPANY_UPDATED">Company Updated</option>
              <option value="COMPANY_DELETED">Company Deleted</option>
              <option value="MEMBER_ROLE_UPDATED">Member Role Updated</option>
              <option value="MEMBER_REMOVED">Member Removed</option>
              <option value="OWNERSHIP_TRANSFERRED">Ownership Transferred</option>
            </select>
          </div>

          {/* Entity Type Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Entity Type
            </label>
            <select
              value={entityTypeFilter}
              onChange={(e) => setEntityTypeFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Entity Types</option>
              <option value="USER">USER</option>
              <option value="COMPANY">COMPANY</option>
              <option value="COMPANY_MEMBER">COMPANY_MEMBER</option>
              <option value="COMPANY_INVITATION">COMPANY_INVITATION</option>
              <option value="COMPANY_LOGO">COMPANY_LOGO</option>
            </select>
          </div>

          {/* Company Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Company
            </label>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Companies</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Date From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Date To */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Date To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filter Action Buttons */}
          <div className="flex items-end space-x-2 sm:col-span-2 lg:col-span-2">
            <Button
              onClick={handleApplyFilters}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2 rounded-lg transition-colors flex items-center space-x-1.5"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Apply Filters</span>
            </Button>
            <Button
              onClick={handleClearFilters}
              variant="outline"
              className="border-slate-200 dark:border-slate-700 text-xs px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </Button>
          </div>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading platform audit logs...
            </p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3">
            <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Failed to load audit logs
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
            <Button
              onClick={fetchAuditLogs}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2"
            >
              Retry
            </Button>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              No audit logs found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No audit records match your active filter criteria. Try adjusting or clearing your filters.
            </p>
            <Button
              onClick={handleClearFilters}
              variant="outline"
              className="text-xs"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Admin</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Admin Column */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-medium text-xs">
                          {log.actor?.name
                            ? log.actor.name.charAt(0).toUpperCase()
                            : "A"}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {log.actor?.name || "System Admin"}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {log.actor?.email || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Action Column */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          ACTION_COLORS[log.action] ||
                          "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {formatActionLabel(log.action)}
                      </span>
                    </td>

                    {/* Entity Column */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {log.entityType}
                        </span>
                        {log.entityId && (
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono truncate max-w-[140px]">
                            {log.entityId}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Company Column */}
                    <td className="py-3.5 px-4">
                      {log.company?.name ? (
                        <div className="flex items-center space-x-1.5 text-xs text-slate-800 dark:text-slate-200 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.company.name}</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          Platform-wide
                        </span>
                      )}
                    </td>

                    {/* Date & Time Column */}
                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>

                    {/* Details Button */}
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        onClick={() => setSelectedLog(log)}
                        variant="ghost"
                        size="sm"
                        className="text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION FOOTER */}
        {!loading && !error && logs.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <div>
              Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{start}</span> to{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{end}</span> of{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{total}</span> audit records
            </div>

            <div className="flex items-center space-x-2">
              <span className="mr-2">
                Page {pagination.page} of {pagination.totalPages || 1}
              </span>

              <Button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={!pagination.hasPreviousPage}
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-xs"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <Button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNextPage}
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-xs"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* DETAILS MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    Audit Log Entry Details
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    ID: <span className="font-mono">{selectedLog.id}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg space-y-1">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Performing Admin</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedLog.actor?.name || "System Admin"}
                </p>
                <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                  {selectedLog.actor?.email || "N/A"}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg space-y-1">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Action</span>
                <div>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      ACTION_COLORS[selectedLog.action] ||
                      "bg-slate-100 dark:bg-slate-800 text-slate-700 border-slate-200"
                    }`}
                  >
                    {formatActionLabel(selectedLog.action)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">{selectedLog.action}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg space-y-1">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Target Entity</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedLog.entityType}
                </p>
                <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                  ID: {selectedLog.entityId || "N/A"}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg space-y-1">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Associated Company</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedLog.company?.name || "Platform-wide / Independent"}
                </p>
                {selectedLog.companyId && (
                  <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    ID: {selectedLog.companyId}
                  </p>
                )}
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg space-y-1">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Timestamp</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatDate(selectedLog.createdAt)}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg space-y-1">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Client Info</span>
                <p className="font-mono text-slate-700 dark:text-slate-300">
                  IP: {selectedLog.ipAddress || "N/A"}
                </p>
                <p className="text-slate-500 dark:text-slate-400 truncate text-[11px]">
                  Agent: {selectedLog.userAgent || "N/A"}
                </p>
              </div>
            </div>

            {/* Metadata Section */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Event Metadata
              </span>
              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 ? (
                <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl overflow-x-auto text-xs font-mono border border-slate-800 leading-relaxed">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-xs text-slate-500 italic text-center">
                  No additional metadata details recorded for this action.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setSelectedLog(null)}
                variant="outline"
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
