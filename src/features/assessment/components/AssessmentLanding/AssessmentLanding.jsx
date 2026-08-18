"use client";

import {
  Clock,
  Gamepad2,
  HelpCircle,
  Play,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { getAssessmentSummary } from "../../utils";

const StatCard = ({ icon: Icon, label, value, color = "blue" }) => {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${colorMap[color]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const AssessmentLanding = ({
  candidate,
  assessment,
  assignment,
  onStart,
  isStarting = false,
  hasAttempt = false,
}) => {
  const { games, quizzes, totalSections } = getAssessmentSummary(assessment);
  const duration = assessment.duration ?? 45;
  const isCompleted = assignment.status === "Completed";

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      {/* Page title */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          Assessment Invitation
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          {assessment.title}
        </h1>

        {assessment.description && (
          <p className="mt-2 text-slate-500 leading-relaxed">
            {assessment.description}
          </p>
        )}

        <p className="mt-3 text-sm text-muted-foreground">
          Hello{" "}
          <span className="font-semibold text-foreground">{candidate.name}</span>
          , review the assessment information before starting.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Gamepad2}
          label="Games"
          value={games}
          color="purple"
        />
        <StatCard
          icon={HelpCircle}
          label="Quizzes"
          value={quizzes}
          color="blue"
        />
        <StatCard
          icon={Clock}
          label="Minutes"
          value={duration}
          color="green"
        />
      </div>

      {/* Assessment overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assessment Overview</CardTitle>
        </CardHeader>

        <CardContent className="space-y-0 divide-y">
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-muted-foreground">Total Sections</span>
            <span className="text-sm font-medium">{totalSections}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-muted-foreground">Status</span>
            <span className="text-sm font-medium">{assignment.status}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-muted-foreground">Passing Score</span>
            <span className="text-sm font-medium">
              {assessment.passingScore ?? "--"}%
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-muted-foreground">Duration</span>
            <span className="text-sm font-medium">{duration} minutes</span>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Before You Start</CardTitle>
        </CardHeader>

        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              "Complete the assessment in one sitting.",
              "Make sure you have a stable internet connection.",
              "Avoid refreshing or closing the browser while the assessment is active.",
              "Submit your assessment before the available time ends.",
              ...(assessment.shuffleQuestions
                ? ["Questions will appear in a different order than usual."]
                : []),
            ].map((instruction, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                {instruction}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* CTA */}
      {isCompleted ? (
        <div className="rounded-xl border bg-muted p-6 text-center">
          <p className="font-semibold text-slate-900">Assessment Completed</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This assessment has already been submitted. Thank you!
          </p>
        </div>
      ) : (
        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={onStart}
            disabled={isStarting}
            className="min-w-[180px]"
          >
            <Play className="mr-2 h-4 w-4" />
            {isStarting
              ? "Loading..."
              : hasAttempt
              ? "Continue Assessment"
              : "Start Assessment"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AssessmentLanding;
