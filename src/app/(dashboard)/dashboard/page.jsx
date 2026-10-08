"use client";

import DashboardMetricCards from "@/features/dashboard/components/DashboardMetricCards";
import RecentResultsTable from "@/features/dashboard/components/RecentResultsTable";

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── 1. 4 KPI Metric Cards ── */}
      <DashboardMetricCards />

      {/* ── 2. Recent Assessment Results (Full Width) ── */}
      <div className="w-full">
        <RecentResultsTable />
      </div>
    </div>
  );
}
