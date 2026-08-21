"use client";

import Link from "next/link";
import {
  Clock,
  Eye,
  Gamepad2,
  HelpCircle,
  Pencil,
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
  if (!assessment) return null;

  const duration =
    assessment.duration ??
    assessment.durationMinutes ??
    60;

  const gamesCount =
    assessment.gameIds?.length ??
    (Array.isArray(assessment.games) ? assessment.games.length : null) ??
    assessment._count?.games ??
    (typeof assessment.games === "number" ? assessment.games : 0);

  const questionsCount =
    assessment.questionIds?.length ??
    (Array.isArray(assessment.questions) ? assessment.questions.length : null) ??
    assessment._count?.questions ??
    (typeof assessment.mcqs === "number" ? assessment.mcqs : 0);

  const candidatesCount =
    assessment.candidateCount ??
    (Array.isArray(assessment.candidates) ? assessment.candidates.length : null) ??
    assessment._count?.candidateAssessments ??
    (typeof assessment.candidates === "number" ? assessment.candidates : 0);

  const passingScore = assessment.passingScore ?? 70;

  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <CardTitle className="line-clamp-1 text-lg font-bold">
              {assessment.title || "Untitled Assessment"}
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
          <p className="line-clamp-2 text-sm text-muted-foreground mt-1">
            {assessment.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col">
        <div className="grid grid-cols-2 gap-3.5 text-sm">
          <Metric
            icon={Clock}
            value={`${duration} min`}
          />

          <Metric
            icon={Gamepad2}
            value={`${gamesCount} games`}
          />

          <Metric
            icon={HelpCircle}
            value={`${questionsCount} questions`}
          />

          <Metric
            icon={Users}
            value={`${candidatesCount} candidates`}
          />
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Passing score:{" "}
          <span className="font-medium text-foreground">
            {passingScore}%
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t pt-4">
          <p className="text-xs text-muted-foreground">
            Created {formatAssessmentDate(assessment.createdAt)}
          </p>

          <div className="flex items-center gap-2">
            <Link href={`/assessments/${assessment.id}`}>
              <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                View
              </Button>
            </Link>

            <Link href={`/assessments/${assessment.id}/edit`}>
              <Button size="sm" className="h-8 px-3 text-xs">
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Metric = ({ icon: Icon, value }) => {
  return (
    <div className="flex items-center gap-2 text-slate-600">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="text-xs sm:text-sm font-medium">{value}</span>
    </div>
  );
};

export default AssessmentCard;
