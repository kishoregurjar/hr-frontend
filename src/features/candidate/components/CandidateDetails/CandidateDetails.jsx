import {
  CalendarDays,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { formatCandidateDate } from "../../utils";
import CandidateStatusBadge from "../CandidateStatusBadge";

const CandidateDetails = ({ candidate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserRound className="h-5 w-5" />
          Candidate Information
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="mt-1 font-medium">{candidate.name}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <div className="mt-1">
              <CandidateStatusBadge status={candidate.status} />
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <div className="mt-1 flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <p>{candidate.email}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <div className="mt-1 flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <p>{candidate.phone || "—"}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Created</p>
            <div className="mt-1 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <p>{formatCandidateDate(candidate.createdAt)}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Last Updated</p>
            <div className="mt-1 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <p>{formatCandidateDate(candidate.updatedAt)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateDetails;
