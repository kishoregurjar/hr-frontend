import { Progress } from "@/components/ui/progress";

const AssessmentProgress = ({ current, total }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">Progress</span>
        <span className="tabular-nums text-muted-foreground">
          {current} / {total}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
};

export default AssessmentProgress;
