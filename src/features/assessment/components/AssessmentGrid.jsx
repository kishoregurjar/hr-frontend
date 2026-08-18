import { AssessmentCard } from ".";

const AssessmentGrid = ({ assessments }) => {
  if (!assessments || !assessments.length) {
    return null;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {assessments.map((assessment) => (
        <AssessmentCard
          key={assessment.id}
          assessment={assessment}
        />
      ))}
    </div>
  );
};

export default AssessmentGrid;
