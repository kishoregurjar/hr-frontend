"use client";

import DashboardHeader from "@/features/dashboard/components/DashboardHeader";
import DashboardHeroBanner from "@/features/dashboard/components/DashboardHeroBanner";
import DashboardMetricCards from "@/features/dashboard/components/DashboardMetricCards";
import ScreeningWorkflowCard from "@/features/dashboard/components/ScreeningWorkflowCard";
import RecentResultsTable from "@/features/dashboard/components/RecentResultsTable";

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── 1. Top Header ── */}
      <DashboardHeader />

      {/* ── 2. Hero Gradient Banner ── */}
      <DashboardHeroBanner />

      {/* ── 3. 4 KPI Metric Cards ── */}
      <DashboardMetricCards />

      {/* ── 4. Bottom 2-Column Grid (Workflow + Results) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 1/3 Col: Screening Workflow Guide */}
        <div className="lg:col-span-1">
          <ScreeningWorkflowCard />
        </div>

        {/* Right 2/3 Col: Recent Assessment Results Table */}
        <div className="lg:col-span-2">
          <RecentResultsTable />
        </div>
      </div>
    </div>
  );
}
