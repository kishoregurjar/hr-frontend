import { Badge } from "@/components/ui/badge";

const DecisionBadge = ({ decision = "Pending" }) => {
  let variant = "secondary";
  let colorStyles = "";

  if (decision === "Shortlisted") {
    variant = "default";
    colorStyles = "bg-green-600 text-white hover:bg-green-600 border-green-600";
  } else if (decision === "Rejected") {
    variant = "destructive";
  } else if (decision === "Pending") {
    colorStyles = "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200";
  }

  return (
    <Badge variant={variant} className={colorStyles}>
      {decision}
    </Badge>
  );
};

export default DecisionBadge;
