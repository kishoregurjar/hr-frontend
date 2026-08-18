import { Badge } from "@/components/ui/badge";

import { CANDIDATE_STATUS } from "../../constants";

const CandidateStatusBadge = ({ status }) => {
  const variantMap = {
    [CANDIDATE_STATUS.NEW]: "secondary",

    [CANDIDATE_STATUS.INVITED]: "outline",

    [CANDIDATE_STATUS.IN_PROGRESS]: "secondary",

    [CANDIDATE_STATUS.COMPLETED]: "default",

    [CANDIDATE_STATUS.SHORTLISTED]: "default",

    [CANDIDATE_STATUS.REJECTED]: "destructive",
  };

  return (
    <Badge variant={variantMap[status] ?? "secondary"}>
      {status}
    </Badge>
  );
};

export default CandidateStatusBadge;
