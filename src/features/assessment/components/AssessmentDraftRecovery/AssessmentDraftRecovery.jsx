"use client";

import { FileClock, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AssessmentDraftRecovery = ({ draft, onRestore, onDiscard }) => {
  if (!draft) {
    return null;
  }

  const savedAt = draft.savedAt
    ? new Date(draft.savedAt).toLocaleString()
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileClock className="h-5 w-5" />
          Unsaved assessment found
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <p className="text-sm">
            We found an assessment that was not finished.
          </p>

          {draft.assessment?.title && (
            <p className="mt-2 font-medium">
              {draft.assessment.title}
            </p>
          )}

          {savedAt && (
            <p className="mt-1 text-xs text-muted-foreground">
              Last saved {savedAt}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={onRestore}>
            Continue Assessment
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onDiscard}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Start Fresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssessmentDraftRecovery;
