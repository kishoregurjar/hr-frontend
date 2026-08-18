import Link from "next/link";
import {
  Clock,
  Gamepad2,
  HelpCircle,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { formatAssessmentDate } from "../../utils";
import AssessmentStatusBadge from "../AssessmentStatusBadge";
import AssessmentCardActions from "../AssessmentCardActions";

const AssessmentCard = ({
  assessment,
  onPublish,
  onArchive,
  onRestore,
  isPending,
}) => {
  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <CardTitle className="line-clamp-1 text-lg">
              {assessment.title}
            </CardTitle>

            <AssessmentStatusBadge status={assessment.status} />
          </div>

          <AssessmentCardActions
            assessment={assessment}
            onPublish={onPublish}
            onArchive={onArchive}
            onRestore={onRestore}
            isPending={isPending}
          />
        </div>

        {assessment.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {assessment.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <Metric
            icon={Clock}
            value={`${assessment.duration} min`}
          />

          <Metric
            icon={Gamepad2}
            value={`${assessment.gameIds?.length ?? 0} games`}
          />

          <Metric
            icon={HelpCircle}
            value={`${assessment.questionIds?.length ?? 0} questions`}
          />

          <Metric
            icon={Users}
            value={`${assessment.candidateCount ?? 0} candidates`}
          />
        </div>

        <div className="mt-5 text-sm text-muted-foreground">
          Passing score{" "}
          <span className="font-medium text-foreground">
            {assessment.passingScore}%
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t pt-5">
          <p className="text-xs text-muted-foreground">
            Created {formatAssessmentDate(assessment.createdAt)}
          </p>

          <Link href={`/assessments/${assessment.id}`}>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

const Metric = ({ icon: Icon, value }) => {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span>{value}</span>
    </div>
  );
};

export default AssessmentCard;
