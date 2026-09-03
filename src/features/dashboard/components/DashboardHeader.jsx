"use client";

const DashboardHeader = () => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-1">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Recruitment Analytics & Screening
        </h1>
        <p className="text-xs text-muted-foreground font-medium mt-0.5">
          Monitor candidate assessments, pipeline throughput, and score distributions in real time.
        </p>
      </div>
    </div>
  );
};

export default DashboardHeader;
