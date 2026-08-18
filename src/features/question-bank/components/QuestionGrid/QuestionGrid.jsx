import { motion } from "framer-motion";
import { QuestionCard } from "..";
import { fadeInUp } from "@/lib/animations";

const QuestionGrid = ({ questions }) => {
  return (
    <div className="grid gap-8 md:grid-cols-2 2xl:grid-cols-3">
      {questions.map((question, index) => (
        <motion.div
          key={question.id}
          {...fadeInUp}
          transition={{
            ...fadeInUp.transition,
            delay: index * 0.08,
          }}
        >
          <QuestionCard question={question} />
        </motion.div>
      ))}
    </div>
  );
};

export default QuestionGrid;
