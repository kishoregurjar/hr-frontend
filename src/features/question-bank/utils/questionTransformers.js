import { DIFFICULTY } from "@/constants";
import { QUESTION_STATUS, QUESTION_TYPE } from "../constants";

export const transformQuestionFormToPayload = (data) => {
  return {
    question: data.question.trim(),
    category: data.category?.trim() || "",
    categoryId: data.categoryId || data.category,
    difficulty: data.difficulty,
    type: data.type,
    status: data.status,

    options: [
      {
        id: "optionA",
        text: data.optionA.trim(),
        isCorrect: data.correctAnswer === "optionA",
      },
      {
        id: "optionB",
        text: data.optionB.trim(),
        isCorrect: data.correctAnswer === "optionB",
      },
      {
        id: "optionC",
        text: data.optionC.trim(),
        isCorrect: data.correctAnswer === "optionC",
      },
      {
        id: "optionD",
        text: data.optionD.trim(),
        isCorrect: data.correctAnswer === "optionD",
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
    tagIds: Array.isArray(question.tags)
      ? question.tags.map((t) => (typeof t === "object" ? t.id || t.tagId || t.name : t))
      : Array.isArray(question.tagIds)
      ? question.tagIds
      : [],
  };
};
