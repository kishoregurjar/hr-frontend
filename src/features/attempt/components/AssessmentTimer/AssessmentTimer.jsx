import { Clock } from "lucide-react";
import { formatRemainingTime } from "../../utils";

const AssessmentTimer = ({ remainingSeconds }) => {
  const isLow = remainingSeconds <= 5 * 60;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-sm font-semibold transition-colors ${
        isLow
          ? "border-destructive/60 bg-destructive/10 text-destructive animate-pulse"
          : "border-input bg-card text-foreground"
      }`}
    >
      <Clock className="h-4 w-4" />
      {formatRemainingTime(remainingSeconds)}
    </div>
  );
};

export default AssessmentTimer;
