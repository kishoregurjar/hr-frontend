import { AssessmentBuilder } from "../components";

const CreateAssessment = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Create Assessment
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Build a hiring assessment by selecting
          games and questions from your library.
        </p>
      </div>

      <AssessmentBuilder />
    </div>
  );
};

export default CreateAssessment;
