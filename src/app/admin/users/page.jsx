"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  Building2,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { getAdminUsers } from "@/lib/api/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import InviteAdminModal from "@/components/admin/InviteAdminModal";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
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
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (roleFilter !== "ALL") {
        params.role = roleFilter;
      }

      const data = await getAdminUsers(params);

      const userList = Array.isArray(data?.users) ? data.users : [];
      setUsers(userList);
      if (data?.pagination) {
        setPagination(data.pagination);
      } else {
        setPagination({
          page,
          limit,
          total: userList.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        });
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsers([]);
      setPagination({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
    setPage(1);
  };

  const total = pagination.total || 0;
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const totalPages = pagination.totalPages || 1;

  const renderCompanyRoleBadge = (companyRole) => {
    if (!companyRole) {
      return <span className="text-slate-400 font-bold px-1">—</span>;
    }

    switch (companyRole) {
      case "OWNER":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] font-bold">
            OWNER
          </Badge>
        );
      case "ADMIN":
        return (
          <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 text-[10px] font-bold">
            ADMIN
          </Badge>
        );
      case "RECRUITER":
        return (
          <Badge className="bg-sky-100 text-sky-800 border-sky-200 text-[10px] font-bold">
            RECRUITER
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] font-bold">
            {companyRole}
          </Badge>
        );
    }
  };

  return (
    <>
      <AdminHeader
        title="Platform Users & HR Directory"
        subtitle="Manage HR Administrators, Recruiters, and Super Admin Accounts"
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        {/* ── Top Action Bar ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-80">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search user by name, email, company..."
                value={search}
                onChange={handleSearchChange}
                className="h-10 w-full pl-9 pr-3 rounded-xl border bg-card text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={handleRoleFilterChange}
              className="h-10 px-3 rounded-xl border bg-card text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="ALL">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="HR">HR / Recruiter</option>
            </select>
          </div>

          <Button
            onClick={() => setIsInviteModalOpen(true)}
            className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5 shadow-md shadow-blue-500/20 shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Invite Platform Admin
          </Button>
        </div>

        {/* ── Users Data Table ── */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-50/80 border-b text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3.5 px-6">User Name</th>
                  <th className="py-3.5 px-6">Email Address</th>
                  <th className="py-3.5 px-6">Associated Company</th>
                  <th className="py-3.5 px-6">Platform Role</th>
                  <th className="py-3.5 px-6">Company Role</th>
                  <th className="py-3.5 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent text-blue-600 mb-2" />
                      <p className="text-xs font-semibold text-slate-600">Loading users...</p>
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {typeof user.name === "string" && user.name.trim()
                              ? user.name
                                  .split(" ")
                                  .filter(Boolean)
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase()
                              : "U"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">
                              {user.name}
                            </p>
                            <p className="text-muted-foreground text-[11px]">
                              Active {user.lastActive || "Recently"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-semibold text-slate-900">
                        {user.email}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          {user.company || "Independent"}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <Badge
                          className={`text-[10px] font-bold ${
                            user.role === "SUPER_ADMIN"
                              ? "bg-purple-100 text-purple-800 border-purple-200"
                              : "bg-blue-100 text-blue-800 border-blue-200"
                          }`}
                        >
                          {user.role}
                        </Badge>
                      </td>

                      <td className="py-4 px-6">
                        {renderCompanyRoleBadge(user.companyRole)}
                      </td>

                      <td className="py-4 px-6">
                        <Badge
                          className={`text-[10px] font-bold ${
                            user.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : user.status === "INVITED"
                              ? "bg-amber-100 text-amber-800 border-amber-200"
                              : "bg-slate-100 text-slate-800 border-slate-200"
                          }`}
                        >
                          {user.status || "ACTIVE"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Users className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                      <p className="text-xs font-bold text-slate-700">No platform users found</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Users will populate once accounts are registered in the database.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── Production Pagination Controls ── */}
          {!loading && total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-slate-50/50 border-t text-xs font-semibold text-slate-600">
              <div>
                Showing <span className="text-slate-900">{start}</span>–
                <span className="text-slate-900">{end}</span> of{" "}
                <span className="text-slate-900">{total}</span> users
              </div>

              <div className="flex items-center gap-3">
                <span className="text-slate-500">
                  Page {page} of {totalPages}
                </span>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={loading || !pagination.hasPreviousPage || page <= 1}
                    className="h-8 w-8 p-0 rounded-lg border-slate-200 hover:bg-slate-100 disabled:opacity-40"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="h-4 w-4 text-slate-600" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={loading || !pagination.hasNextPage || page >= totalPages}
                    className="h-8 w-8 p-0 rounded-lg border-slate-200 hover:bg-slate-100 disabled:opacity-40"
                    aria-label="Next Page"
                  >
                    <ChevronRight className="h-4 w-4 text-slate-600" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Invite Platform Admin Modal */}
      <InviteAdminModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={fetchUsers}
      />
    </>
  );
}
