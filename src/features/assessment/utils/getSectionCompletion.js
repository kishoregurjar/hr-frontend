import { SECTION_STATUS } from "../constants";
import { getGameCompletion } from "./getGameCompletion";
import { getQuizCompletion } from "./getQuizCompletion";

export const getSectionCompletion = ({ section, attempt }) => {
  if (section.type === "quiz") {
    const quiz = getQuizCompletion({ section, attempt });

    return {
      status: quiz.isComplete
        ? SECTION_STATUS.COMPLETED
        : SECTION_STATUS.INCOMPLETE,
      isComplete: quiz.isComplete,
      label: `${quiz.answeredQuestions} / ${quiz.totalQuestions} answered`,
      details: quiz,
    };
  }

  if (section.type === "game") {
    const game = getGameCompletion({ section, attempt });

    return {
      status: game.isComplete
        ? SECTION_STATUS.COMPLETED
        : SECTION_STATUS.INCOMPLETE,
      isComplete: game.isComplete,
      label: game.isComplete ? "Game completed" : "Game not completed",
      details: game,
    };
  }

  return {
    status: SECTION_STATUS.INCOMPLETE,
    isComplete: false,
    label: "Section incomplete",
    details: null,
  };
};
