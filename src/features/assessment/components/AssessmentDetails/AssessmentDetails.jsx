import {
  Clock,
  Gamepad2,
  HelpCircle,
  RotateCcw,
  Target,
  Users,
  Check,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import AssessmentStatusBadge from "../AssessmentStatusBadge";

const AssessmentDetails = ({
  assessment,
  games = [],
  questions = [],
  actions = null,
}) => {
  const selectedGames = games.filter((game) =>
    assessment.gameIds?.includes(game.id)
  );

  const selectedQuestions = questions.filter((question) =>
    assessment.questionIds?.includes(question.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {assessment.title}
            </h1>

            <AssessmentStatusBadge status={assessment.status} />
          </div>

          {assessment.description && (
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              {assessment.description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap gap-3">
            {actions}
          </div>
        )}
      </div>

      {/* Overview */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <OverviewCard
          icon={Clock}
          label="Duration"
          value={`${assessment.duration} min`}
        />

        <OverviewCard
          icon={Target}
          label="Passing Score"
          value={`${assessment.passingScore}%`}
        />

        <OverviewCard
          icon={RotateCcw}
          label="Attempts"
          value={assessment.attemptsAllowed}
        />

        <OverviewCard
          icon={Gamepad2}
          label="Games"
          value={selectedGames.length}
        />

        <OverviewCard
          icon={HelpCircle}
          label="Questions"
          value={selectedQuestions.length}
        />
      </div>

      {/* Games */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Gamepad2 className="h-5 w-5" />
            Games ({selectedGames.length})
          </CardTitle>
        </CardHeader>

        <CardContent>
          {selectedGames.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {selectedGames.map((game) => (
                <div
                  key={game.id}
                  className="rounded-lg border p-4"
                >
                  <p className="font-medium">
                    {game.title ?? game.name}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {game.category && (
                      <Badge variant="secondary">
                        {game.category}
                      </Badge>
                    )}

                    {game.difficulty && (
                      <Badge variant="outline">
                        {game.difficulty}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No games included in this assessment.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Questions ({selectedQuestions.length})
          </CardTitle>
        </CardHeader>

        <CardContent>
          {selectedQuestions.length > 0 ? (
            <div className="space-y-3">
              {selectedQuestions.map((question, index) => (
                <div
                  key={question.id}
                  className="flex gap-3 rounded-lg border p-4"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {question.question}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {question.category}
                      </Badge>

                      <Badge variant="outline">
                        {question.difficulty}
                      </Badge>

                      <Badge variant="outline">
                        {question.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No questions included in this assessment.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Candidate Settings
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <SettingRow
            label="Shuffle Questions"
            enabled={assessment.shuffleQuestions}
          />

          <SettingRow
            label="Show Result to Candidate"
            enabled={assessment.showResultToCandidate}
          />
        </CardContent>
      </Card>

      {/* Candidates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5" />
            Candidates
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div>
            <p className="text-2xl font-semibold">
              {assessment.candidateCount ?? 0}
            </p>

            <p className="text-sm text-muted-foreground">
              Candidates assigned to this assessment
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const OverviewCard = ({ icon: Icon, label, value }) => {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <Icon className="h-5 w-5 text-muted-foreground" />

        <div>
          <p className="text-xs text-muted-foreground">
            {label}
          </p>

          <p className="font-semibold">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const SettingRow = ({ label, enabled }) => {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <p className="text-sm font-medium">
        {label}
      </p>

      {enabled ? (
        <span className="flex items-center gap-2 text-sm font-medium text-primary">
          <Check className="h-4 w-4" />
          Enabled
        </span>
      ) : (
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <X className="h-4 w-4" />
          Disabled
        </span>
      )}
    </div>
  );
};

export default AssessmentDetails;
