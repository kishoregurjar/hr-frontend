export const calculateQuizScore = ({ section, responses }) => {
  const questions = section.questions ?? [];

  if (questions.length === 0) {
    return {
      score: 0,
      correctAnswers: 0,
      totalQuestions: 0,
    };
  }

  let correctAnswers = 0;

  questions.forEach((question) => {
    const candidateAnswer = responses?.[question.id];

    if (
      candidateAnswer != null &&
      String(candidateAnswer) === String(question.correctAnswer ?? "c")
    ) {
      correctAnswers += 1;
    }
  });

  const score = (correctAnswers / questions.length) * 100;

  return {
    score,
    correctAnswers,
    totalQuestions: questions.length,
  };
};
