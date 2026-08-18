import { Plus } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

const AssessmentHeader = () => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Assessments
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage and organize your hiring assessments.
        </p>
      </div>

      <Link
        href="/assessments/create"
        className={buttonVariants({ className: "gap-2" })}
      >
        <Plus className="h-4 w-4" />
        Create Assessment
      </Link>
    </div>
  );
};

export default AssessmentHeader;

