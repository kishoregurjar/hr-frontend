import { Badge } from "@/components/ui/badge";

const statusVariants = {
  Draft: "secondary",
  Published: "default",
  Active: "default",
  Archived: "outline",
  Completed: "default",
  Pending: "secondary",
};

const StatusBadge = ({ status }) => {
  return (
    <Badge variant={statusVariants[status] || "secondary"}>
      {status}
    </Badge>
  );
};

export default StatusBadge;
