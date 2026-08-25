import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

const QuestionSelectionCard = ({
  question,
  selected,
  onToggle,
}) => {
  const qId = question.id || question._id;
  const qTitle = question.title || question.question || question.text || "Untitled Question";
  const qCategory = question.category?.name || question.category || question.categoryName || "General";

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onToggle(qId)}
      onKeyDown={(event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          onToggle(qId);
        }
      }}
      className={`cursor-pointer transition ${
        selected
          ? "border-primary ring-1 ring-primary"
          : "hover:border-primary/50"
      }`}
    >
      <CardContent className="flex gap-4 p-5">
        <div
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
            selected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input"
          }`}
        >
          {selected && (
            <Check className="h-3.5 w-3.5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-medium leading-relaxed">
            {qTitle}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary">
              {qCategory}
            </Badge>

            <Badge variant="outline">
              {question.difficulty || "Easy"}
            </Badge>

            <Badge variant="outline">
              {question.type || "MCQ"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionSelectionCard;
