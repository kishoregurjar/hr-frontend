import { CandidateDetail } from "@/features/candidate";

const CandidateDetailPage = async ({ params }) => {
  const { id } = await params;

  return <CandidateDetail candidateId={id} />;
};

export default CandidateDetailPage;
