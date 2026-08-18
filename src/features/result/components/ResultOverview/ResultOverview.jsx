import ScoreCard from "../ScoreCard";

const ResultOverview = ({ result }) => {
  if (!result) return null;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <ScoreCard
        label="Final Score"
        value={result.score != null ? `${result.score}%` : "—"}
        description="Overall assessment performance"
      />

      <ScoreCard
        label="Quiz Score"
        value={result.quizScore != null ? `${result.quizScore}%` : "—"}
        description="Performance across quizzes"
      />

      <ScoreCard
        label="Game Score"
        value={result.gameScore != null ? `${result.gameScore}%` : "—"}
        description="Performance across games"
      />
    </div>
  );
};

export default ResultOverview;
