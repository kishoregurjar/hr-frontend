import { calculateGameScore } from "./calculateGameScore";
import { calculateQuizScore } from "./calculateQuizScore";
import { validateScoringConfig } from "./validateScoringConfig";

const roundScore = (value) => {
  return Math.round(value * 100) / 100;
};

export const calculateAssessmentScore = ({ assessment, attempt }) => {
  const sections = assessment?.sections ?? [];

  const sectionScores = sections
    .map((section) => {
      if (section.type === "quiz") {
        const quizResult = calculateQuizScore({
          section,
          responses: attempt?.responses?.[section.id] ?? {},
        });

        return {
          id: section.id,
          type: "quiz",
          title: section.title,
          score: roundScore(quizResult.score),
          correctAnswers: quizResult.correctAnswers,
          totalQuestions: quizResult.totalQuestions,
        };
      }

      if (section.type === "game") {
        const gameResult = calculateGameScore({
          section,
          result: attempt?.gameResults?.[section.id],
        });

        return {
          id: section.id,
          type: "game",
          title: section.title,
          score: roundScore(gameResult.score),
          rawScore: gameResult.rawScore,
          accuracy: gameResult.accuracy,
        };
      }

      return null;
    })
    .filter(Boolean);

  const quizResults = sectionScores.filter((section) => section.type === "quiz");
  const gameResults = sectionScores.filter((section) => section.type === "game");

  const quizScore =
    quizResults.length > 0
      ? quizResults.reduce((total, s) => total + s.score, 0) / quizResults.length
      : null;

  const gameScore =
    gameResults.length > 0
      ? gameResults.reduce((total, s) => total + s.score, 0) / gameResults.length
      : null;

  const scoring = validateScoringConfig(assessment?.scoring)
    ? assessment.scoring
    : { quizWeight: 40, gameWeight: 60 };

  let finalScore = 0;

  if (quizScore != null && gameScore != null) {
    finalScore =
      quizScore * (scoring.quizWeight / 100) +
      gameScore * (scoring.gameWeight / 100);
  } else if (quizScore != null) {
    finalScore = quizScore;
  } else if (gameScore != null) {
    finalScore = gameScore;
  }

  return {
    score: roundScore(finalScore),
    quizScore: quizScore != null ? roundScore(quizScore) : null,
    gameScore: gameScore != null ? roundScore(gameScore) : null,
    sections: sectionScores,
  };
};
