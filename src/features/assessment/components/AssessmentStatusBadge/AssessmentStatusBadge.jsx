import { Badge } from "@/components/ui/badge";
import { ASSESSMENT_STATUS } from "../../constants";

const AssessmentStatusBadge = ({ status }) => {
  const normalized = String(status || "").toUpperCase();

  let variant = "secondary";
  let label = status || "Draft";

  if (normalized === "PUBLISHED" || status === ASSESSMENT_STATUS.PUBLISHED) {
    variant = "default";
    label = "Published";
  } else if (normalized === "ARCHIVED" || status === ASSESSMENT_STATUS.ARCHIVED) {
    variant = "outline";
    label = "Archived";
  } else if (normalized === "DRAFT" || status === ASSESSMENT_STATUS.DRAFT) {
    variant = "secondary";
    label = "Draft";
  }

  return (
    <Badge variant={variant}>
      {label}
    </Badge>
  );
};

export default AssessmentStatusBadge;
