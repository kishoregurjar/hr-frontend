import { DIFFICULTY } from "@/constants";
import { QUESTION_STATUS } from "./questionStatus";
import { QUESTION_TYPE } from "./questionType";

export const DEFAULT_QUESTION = {
  question: "",
  category: "",
  difficulty: DIFFICULTY.EASY,
  status: QUESTION_STATUS.ACTIVE,
  type: QUESTION_TYPE.MCQ,
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "",
};
