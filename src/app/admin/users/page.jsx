"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  ShieldCheck,
  Building2,
  Mail,
  UserCheck,
  UserX,
  Plus,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { getAdminUsers } from "@/lib/api/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const list = await getAdminUsers();
        setUsers(list);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.company.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === "ALL" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

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
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full pl-9 pr-3 rounded-xl border bg-card text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border bg-card text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="ALL">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="HR_ADMIN">HR Admin</option>
              <option value="HR">HR Recruiter</option>
            </select>
          </div>

          <Button className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5 shadow-md shadow-blue-500/20 shrink-0">
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
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700 font-medium">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
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
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                          {user.status || "ACTIVE"}
                        </Badge>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                        >
                          Edit Role
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Users className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                      <p className="text-xs font-bold text-slate-700">No platform users found</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Users will populate once accounts are registered in the database.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
