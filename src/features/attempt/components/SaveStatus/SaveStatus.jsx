import { Check, Loader2 } from "lucide-react";

const SaveStatus = ({ isSaving, isError, lastSavedAt }) => {
  if (isSaving) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
        <span>Saving...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-xs font-medium text-destructive">
        Save failed
      </p>
    );
  }

  if (lastSavedAt) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Check className="h-3.5 w-3.5 text-green-600" />
        <span>Saved</span>
      </div>
    );
  }

  return null;
};

export default SaveStatus;
