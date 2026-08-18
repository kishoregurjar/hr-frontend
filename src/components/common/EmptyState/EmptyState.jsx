import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

const EmptyState = ({
  title = "No Data Found",
  description = "There is nothing to display.",
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
      <SearchX className="mb-4 h-12 w-12 text-muted-foreground" />

      <h3 className="text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>

      {actionLabel && (
        <Button
          className="mt-6"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
