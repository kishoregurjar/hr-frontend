import { CandidateResult } from "@/features/result/pages";

const CandidateResultPage = async ({ params }) => {
  const { id, resultId } = await params;

  return <CandidateResult assessmentId={id} resultId={resultId} />;
};

export default CandidateResultPage;
