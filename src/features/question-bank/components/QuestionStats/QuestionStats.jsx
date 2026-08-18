import {
  BookOpen,
  CheckCircle2,
  FileText,
  Folder,
} from "lucide-react";
import { QUESTION_STATUS } from "../../constants";
import QuestionStatCard from "./QuestionStatCard";

const QuestionStats = ({ questions = [] }) => {
  const total = questions.length;

  const active = questions.filter(
    (question) => question.status === QUESTION_STATUS.ACTIVE
  ).length;

  const draft = questions.filter(
    (question) => question.status === QUESTION_STATUS.DRAFT
  ).length;

  const categories = new Set(
    questions.map((question) => question.category)
  ).size;

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <QuestionStatCard
        title="Total Questions"
        value={total}
        icon={BookOpen}
      />

      <QuestionStatCard
        title="Active"
        value={active}
        icon={CheckCircle2}
      />

      <QuestionStatCard
        title="Draft"
        value={draft}
        icon={FileText}
      />

      <QuestionStatCard
        title="Categories"
        value={categories}
        icon={Folder}
      />
    </div>
  );
};

export default QuestionStats;
