import { DIFFICULTY } from "@/constants";
import { QUESTION_STATUS, QUESTION_TYPE } from "../constants";

export const transformQuestionFormToPayload = (data) => {
  return {
    question: data.question.trim(),
    category: data.category.trim(),
    difficulty: data.difficulty,
    type: data.type,
    status: data.status,

    options: [
      {
        id: "optionA",
        text: data.optionA.trim(),
      },
      {
        id: "optionB",
        text: data.optionB.trim(),
      },
      {
        id: "optionC",
        text: data.optionC.trim(),
      },
      {
        id: "optionD",
        text: data.optionD.trim(),
      },
    ],

    correctAnswer: data.correctAnswer,
  };
};

export const transformQuestionToForm = (question) => {
  if (!question) return null;

  const getOptionText = (id) => {
    return (
      question.options?.find(
        (option) => option.id === id
      )?.text || ""
    );
  };

  return {
    question: question.question || "",
    category: question.category || "",
    difficulty: question.difficulty || DIFFICULTY.EASY,
    type: question.type || QUESTION_TYPE.MCQ,
    status: question.status || QUESTION_STATUS.ACTIVE,

    optionA: getOptionText("optionA"),
    optionB: getOptionText("optionB"),
    optionC: getOptionText("optionC"),
    optionD: getOptionText("optionD"),

    correctAnswer: question.correctAnswer || "",
  };
};
