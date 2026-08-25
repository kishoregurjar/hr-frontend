"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  Plus,
  Shield,
  ExternalLink,
  Users,
  FileCheck,
  TrendingUp,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { getAdminCompanies, toggleCompanyStatus } from "@/lib/api/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const list = await getAdminCompanies();
        setCompanies(list);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const handleToggle = async (companyId, currentStatus) => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setCompanies((prev) =>
      prev.map((c) => (c.id === companyId ? { ...c, status: nextStatus } : c))
    );
    await toggleCompanyStatus(companyId, nextStatus);
  };

  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.domain.toLowerCase().includes(search.toLowerCase()) ||
      c.hrContact.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <AdminHeader
        title="Companies & Tenants"
        subtitle="Manage B2B Client Organizations & Assessment Usage Limits"
      />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl">
        {/* ── Top Action Bar ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-80">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search company name, domain, HR..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full pl-9 pr-3 rounded-xl border bg-card text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border bg-card text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          <Button className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5 shadow-md shadow-blue-500/20">
            <Plus className="h-4 w-4" />
            Onboard New Company
          </Button>
        </div>

        {/* ── Companies Data Table ── */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3.5 px-6">Company & Domain</th>
                  <th className="py-3.5 px-6">HR Lead</th>
                  <th className="py-3.5 px-6">Tier Plan</th>
                  <th className="py-3.5 px-6">Assessments / Candidates</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Master Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700 font-medium">
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-slate-50/60 transition">
                    {/* Column 1: Company & Logo */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                          {company.logo}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {company.name}
                          </p>
                          <p className="text-muted-foreground text-[11px]">
                            {company.domain} • Joined {company.joinedDate}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: HR Contact */}
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-900">{company.hrContact}</p>
                      <p className="text-muted-foreground text-[11px]">{company.email}</p>
                    </td>

                    {/* Column 3: Plan */}
                    <td className="py-4 px-6">
                      <Badge
                        variant="secondary"
                        className={`text-[11px] font-bold ${
                          company.plan === "Enterprise"
                            ? "bg-purple-100 text-purple-800 border-purple-200"
                            : company.plan === "Growth"
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {company.plan}
                      </Badge>
                    </td>

                    {/* Column 4: Usage */}
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">
                        {company.candidatesAssessed} candidates
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        {company.totalAssessments} active assessments
                      </p>
                    </td>

                    {/* Column 5: Status */}
                    <td className="py-4 px-6">
                      <Badge
                        className={`text-[10px] font-bold px-2.5 py-0.5 ${
                          company.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : "bg-rose-100 text-rose-800 border-rose-200"
                        }`}
                      >
                        {company.status}
                      </Badge>
                    </td>

                    {/* Column 6: Toggle Action */}
                    <td className="py-4 px-6 text-right">
                      <Button
                        size="sm"
                        variant={company.status === "ACTIVE" ? "destructive" : "outline"}
                        onClick={() => handleToggle(company.id, company.status)}
                        className="text-xs font-semibold h-8 px-3"
                      >
                        {company.status === "ACTIVE" ? "Suspend Tenant" : "Activate Tenant"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
