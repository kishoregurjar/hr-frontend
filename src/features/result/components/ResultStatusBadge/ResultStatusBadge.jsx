import { Badge } from "@/components/ui/badge";

const ResultStatusBadge = ({ status }) => {
  let variant = "secondary";
  let colorStyles = "";

  if (status === "Completed") {
    variant = "default";
    colorStyles = "bg-green-100 text-green-800 hover:bg-green-100 border-green-200";
  } else if (status === "In Progress") {
    colorStyles = "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200";
  } else if (status === "Invited") {
    colorStyles = "bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200";
  }

  return (
    <Badge variant={variant} className={colorStyles}>
      {status}
    </Badge>
  );
};

export default ResultStatusBadge;
