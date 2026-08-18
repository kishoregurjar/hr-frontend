import QuizRenderer from "../QuizRenderer";
import GameRuntime from "../GameRuntime";

const AssessmentSection = ({ section, attempt, onSectionComplete }) => {
  if (!section) return null;

  if (section.type === "quiz") {
    return (
      <QuizRenderer
        section={section}
        attempt={attempt}
        onComplete={onSectionComplete}
      />
    );
  }

  if (section.type === "game") {
    return (
      <GameRuntime
        section={section}
        attempt={attempt}
        onComplete={onSectionComplete}
      />
    );
  }

  return (
    <div className="rounded-xl border p-8 text-center text-muted-foreground">
      Unsupported assessment section.
    </div>
  );
};

export default AssessmentSection;
