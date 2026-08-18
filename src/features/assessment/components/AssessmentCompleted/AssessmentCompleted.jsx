import { CheckCircle2 } from "lucide-react";

const AssessmentCompleted = ({ assessment, attempt }) => {
  const submittedAt = attempt?.submittedAt
    ? new Date(attempt.submittedAt).toLocaleString()
    : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4 py-12">
      <div className="w-full max-w-xl rounded-2xl border bg-card p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
          Assessment Submitted
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Your responses have been successfully recorded.
        </p>

        <div className="mt-8 rounded-xl border bg-muted/30 p-5 text-left space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Assessment
            </p>
            <p className="mt-1 font-semibold text-slate-900 leading-snug">
              {assessment?.title}
            </p>
          </div>

          {submittedAt && (
            <div className="border-t pt-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Submitted At
              </p>
              <p className="mt-1 font-medium text-slate-700">{submittedAt}</p>
            </div>
          )}
        </div>

        <p className="mt-8 text-xs text-slate-400">
          You can now safely close this browser window.
        </p>
      </div>
    </div>
  );
};

export default AssessmentCompleted;
