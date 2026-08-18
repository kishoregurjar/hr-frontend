import Link from "next/link";
import { Eye, Mail, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import CandidateStatusBadge from "../CandidateStatusBadge";

const CandidateTable = ({
  candidates = [],
  selectedIds = [],
  onToggleCandidate,
  onToggleAll,
}) => {
  const isSelected = (candidateId) => {
    return selectedIds.some(
      (id) => String(id) === String(candidateId)
    );
  };

  const selectedVisibleCount = candidates.filter((candidate) =>
    isSelected(candidate.id)
  ).length;

  const allSelected =
    candidates.length > 0 && selectedVisibleCount === candidates.length;

  const someSelected = selectedVisibleCount > 0 && !allSelected;

  return (
    <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={
                  allSelected
                    ? true
                    : someSelected
                    ? "indeterminate"
                    : false
                }
                onCheckedChange={onToggleAll}
                aria-label="Select all candidates"
              />
            </TableHead>
            <TableHead>Candidate</TableHead>
            <TableHead className="hidden sm:table-cell">Email</TableHead>
            <TableHead className="hidden md:table-cell">Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {candidates.map((candidate) => (
            <TableRow
              key={candidate.id}
              data-state={isSelected(candidate.id) ? "selected" : undefined}
            >
              <TableCell>
                <Checkbox
                  checked={isSelected(candidate.id)}
                  onCheckedChange={() => onToggleCandidate(candidate.id)}
                  aria-label={`Select ${candidate.name}`}
                />
              </TableCell>

              <TableCell>
                <div className="font-medium">{candidate.name}</div>
              </TableCell>

              <TableCell className="hidden sm:table-cell">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate max-w-[160px] block">{candidate.email}</span>
                </div>
              </TableCell>

              <TableCell className="hidden md:table-cell">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {candidate.phone || "—"}
                </div>
              </TableCell>

              <TableCell>
                <CandidateStatusBadge status={candidate.status} />
              </TableCell>

              <TableCell className="text-right">
                <Link href={`/candidates/${candidate.id}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CandidateTable;
