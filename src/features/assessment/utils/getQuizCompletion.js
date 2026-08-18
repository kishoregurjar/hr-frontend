export const getQuizCompletion = ({ section, attempt }) => {
  const questions = section.questions ?? [];
  const responses = attempt?.responses?.[section.id] ?? {};

  const totalQuestions = questions.length;

  const answeredQuestions = questions.filter(
    (question) => responses[question.id] != null
  ).length;

  return {
    totalQuestions,
    answeredQuestions,
    isComplete: totalQuestions > 0 && answeredQuestions === totalQuestions,
  };
};
