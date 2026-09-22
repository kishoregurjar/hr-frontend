import { SECTION_STATUS } from "../constants";
import { getGameCompletion } from "./getGameCompletion";
import { getQuizCompletion } from "./getQuizCompletion";

export const getSectionCompletion = ({ section, attempt }) => {
  if (section.type === "quiz") {
    const quiz = getQuizCompletion({ section, attempt });

    let label = `${quiz.answeredQuestions} / ${quiz.totalQuestions} answered`;
    if (quiz.unansweredQuestions > 0 && quiz.answeredQuestions > 0) {
      label = `${quiz.answeredQuestions} / ${quiz.totalQuestions} answered (${quiz.unansweredQuestions} skipped)`;
    } else if (quiz.answeredQuestions === 0 && quiz.totalQuestions > 0) {
      label = `0 / ${quiz.totalQuestions} answered (All skipped)`;
    }

    return {
      status: quiz.isFullyAnswered || quiz.answeredQuestions > 0
        ? SECTION_STATUS.COMPLETED
        : SECTION_STATUS.INCOMPLETE,
      isComplete: true, // Always allow candidate to complete/submit test
      isFullyAnswered: quiz.isFullyAnswered,
      label,
      details: quiz,
    };
  }

  if (section.type === "game") {
    const game = getGameCompletion({ section, attempt });

    return {
      status: game.isComplete
        ? SECTION_STATUS.COMPLETED
        : SECTION_STATUS.INCOMPLETE,
      isComplete: true, // Allow submission even if games skipped/completed
      label:
        game.totalCount > 1
          ? `${game.completedCount} / ${game.totalCount} games completed`
          : game.isComplete
          ? "Game completed"
          : "Game not completed",
      details: game,
    };
  }

  return {
    status: SECTION_STATUS.INCOMPLETE,
    isComplete: true,
    label: "Section ready",
    details: null,
  };
};
