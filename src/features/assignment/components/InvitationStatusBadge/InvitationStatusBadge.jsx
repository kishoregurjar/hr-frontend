import { Badge } from "@/components/ui/badge";
import { getAssignmentStatus } from "../../utils";

const InvitationStatusBadge = ({ assignment }) => {
  const status = getAssignmentStatus(assignment);

  const variant =
    status === "Completed"
      ? "default"
      : status === "Expired"
      ? "destructive"
      : status === "In Progress"
      ? "secondary"
      : "outline";

  return <Badge variant={variant}>{status}</Badge>;
};

export default InvitationStatusBadge;
