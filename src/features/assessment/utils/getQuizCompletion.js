export const getQuizCompletion = ({ section, attempt }) => {
  const questions = section.questions ?? [];
  const responses = attempt?.responses?.[section.id] ?? {};

  const totalQuestions = questions.length;

  const answeredQuestions = questions.filter(
    (question) => responses[question.id] != null
  ).length;

  const unansweredQuestions = Math.max(0, totalQuestions - answeredQuestions);

  return {
    totalQuestions,
    answeredQuestions,
    unansweredQuestions,
    // A quiz section is ready/valid when candidate has visited or has 0 questions or attempted any
    isComplete: totalQuestions === 0 || answeredQuestions > 0,
    isFullyAnswered: totalQuestions > 0 && answeredQuestions === totalQuestions,
  };
};
