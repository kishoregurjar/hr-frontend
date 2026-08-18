import {
  Clock,
  Users,
  Gamepad2,
  CircleHelp,
  Eye,
  Pencil,
  MoreVertical,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const getStatusVariant = (status) => {
  switch (status) {
    case "Published":
      return "default";
    case "Draft":
      return "secondary";
    case "Archived":
      return "destructive";
    default:
      return "outline";
  }
};

const AssessmentCard = ({ assessment }) => {
  return (
    <Card className="transition-all hover:shadow-lg">
      <CardContent className="space-y-5 p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">
              {assessment.title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {assessment.description}
            </p>
          </div>
          <Badge variant={getStatusVariant(assessment.status)}>
            {assessment.status}
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {assessment.duration} min
          </div>
          <div className="flex items-center gap-2">
            🎯 {assessment.difficulty}
          </div>
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-4 w-4" />
            {assessment.games} Games
          </div>
          <div className="flex items-center gap-2">
            <CircleHelp className="h-4 w-4" />
            {assessment.mcqs} MCQs
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <Users className="h-4 w-4" />
            {assessment.candidates} Candidates
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-muted-foreground">
            Created {assessment.createdAt}
          </span>

          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>

            <Button size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>

            <Button size="icon" variant="ghost">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssessmentCard;
