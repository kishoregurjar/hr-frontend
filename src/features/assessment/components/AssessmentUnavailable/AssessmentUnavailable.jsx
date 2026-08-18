import { AlertCircle } from "lucide-react";

const AssessmentUnavailable = ({
  title = "Assessment Unavailable",
  message,
}) => {
  return (
    <div className="flex min-h-[400px] items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-md text-center space-y-3">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-600">
          <AlertCircle className="h-7 w-7" />
        </div>

        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>

        <p className="text-sm text-muted-foreground">
          {message ?? "This assessment is currently unavailable or inaccessible."}
        </p>
      </div>
    </div>
  );
};

export default AssessmentUnavailable;
