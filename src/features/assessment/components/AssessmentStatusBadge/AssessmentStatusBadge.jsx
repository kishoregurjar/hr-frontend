import { Badge } from "@/components/ui/badge";

import { ASSESSMENT_STATUS } from "../../constants";

const AssessmentStatusBadge = ({ status }) => {
  const variantMap = {
    [ASSESSMENT_STATUS.DRAFT]: "secondary",

    [ASSESSMENT_STATUS.PUBLISHED]: "default",

    [ASSESSMENT_STATUS.ARCHIVED]: "outline",
  };

  return (
    <Badge variant={variantMap[status] ?? "secondary"}>
      {status}
    </Badge>
  );
};

export default AssessmentStatusBadge;
