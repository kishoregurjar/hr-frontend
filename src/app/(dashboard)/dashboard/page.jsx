"use client";

import DashboardHeroBanner from "@/features/dashboard/components/DashboardHeroBanner";
import DashboardMetricCards from "@/features/dashboard/components/DashboardMetricCards";
import RecentResultsTable from "@/features/dashboard/components/RecentResultsTable";

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── 1. Hero Gradient Banner ── */}
      <DashboardHeroBanner />

      {/* ── 2. 4 KPI Metric Cards ── */}
      <DashboardMetricCards />

      {/* ── 3. Recent Assessment Results (Full Width) ── */}
      <div className="w-full">
        <RecentResultsTable />
      </div>
    </div>
  );
}
