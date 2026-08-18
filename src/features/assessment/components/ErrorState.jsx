import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const ErrorState = ({ onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border py-16 text-center">
      <AlertTriangle className="mb-4 h-12 w-12 text-destructive" />
      <h3 className="text-xl font-semibold">
        Something went wrong
      </h3>
      <p className="mt-2 text-muted-foreground">
        We couldn't load your assessments.
      </p>
      <Button
        className="mt-6"
        onClick={onRetry}
      >
        Retry
      </Button>
    </div>
  );
};

export default ErrorState;
