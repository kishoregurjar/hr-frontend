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
  if (!assessment) return null;

  const duration =
    assessment.duration ??
    assessment.durationMinutes ??
    60;

  const selectedGames =
    (Array.isArray(assessment.games) && assessment.games.length > 0
      ? assessment.games.map((g) => g?.game || g).filter(Boolean)
      : null) ||
    (Array.isArray(assessment.AssessmentGames) && assessment.AssessmentGames.length > 0
      ? assessment.AssessmentGames.map((g) => g?.game || g).filter(Boolean)
      : null) ||
    (Array.isArray(assessment.gameIds) && assessment.gameIds.length > 0
      ? games.filter((game) => assessment.gameIds.includes(game.id || game._id))
      : []) ||
    [];

  const selectedQuestions =
    (Array.isArray(assessment.questions) && assessment.questions.length > 0
      ? assessment.questions.map((q) => q?.question || q).filter(Boolean)
      : null) ||
    (Array.isArray(assessment.AssessmentQuestions) && assessment.AssessmentQuestions.length > 0
      ? assessment.AssessmentQuestions.map((q) => q?.question || q).filter(Boolean)
      : null) ||
    (Array.isArray(assessment.questionIds) && assessment.questionIds.length > 0
      ? questions.filter((question) => assessment.questionIds.includes(question.id || question._id))
      : []) ||
    [];

  const questionsCount =
    selectedQuestions.length ||
    assessment.questionCount ||
    assessment.totalQuestions ||
    assessment._count?.questions ||
    assessment._count?.AssessmentQuestions ||
    0;

  const gamesCount =
    selectedGames.length ||
    assessment.gameCount ||
    assessment.totalGames ||
    assessment._count?.games ||
    assessment._count?.AssessmentGames ||
    0;

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
          value={`${duration} min`}
        />

        <OverviewCard
          icon={Target}
          label="Passing Score"
          value={`${assessment.passingScore ?? 70}%`}
        />

        <OverviewCard
          icon={RotateCcw}
          label="Attempts"
          value={assessment.attemptsAllowed ?? assessment.maxAttempts ?? 1}
        />

        <OverviewCard
          icon={Gamepad2}
          label="Games"
          value={gamesCount}
        />

        <OverviewCard
          icon={HelpCircle}
          label="Questions"
          value={questionsCount}
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
              {selectedQuestions.map((question, index) => {
                const qId = question.id || question._id || index;
                const qTitle = question.title || question.question || question.text || `Question ${index + 1}`;
                const qCategory = question.category?.name || question.category || question.categoryName;
                const qDiff = question.difficulty || "Easy";
                const qType = question.type || "MCQ";

                return (
                  <div
                    key={qId}
                    className="flex gap-3 rounded-lg border p-4"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {qTitle}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {qCategory && (
                          <Badge variant="secondary">
                            {qCategory}
                          </Badge>
                        )}

                        <Badge variant="outline">
                          {qDiff}
                        </Badge>

                        <Badge variant="outline">
                          {qType}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
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
