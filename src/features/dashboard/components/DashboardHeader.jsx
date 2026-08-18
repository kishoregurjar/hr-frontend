"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants";

const DashboardHeader = () => {
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back, Rohit 👋
        </h2>

        <p className="mt-2 text-muted-foreground">
          {today}
        </p>
      </div>

      <Link
        href="/assessments/create"
        className={buttonVariants({ variant: "default" })}
      >
        <Plus className="mr-2 h-4 w-4" />
        Create Assessment
      </Link>
    </section>
  );
};

export default DashboardHeader;
