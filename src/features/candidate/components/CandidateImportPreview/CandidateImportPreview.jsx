import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CandidateImportPreview = ({ candidates = [] }) => {
  if (candidates.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="font-medium">Valid Candidates</h3>

      <div className="max-h-64 overflow-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Row</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {candidates.map(({ rowNumber, candidate }) => (
              <TableRow key={`${rowNumber}-${candidate.email}`}>
                <TableCell>{rowNumber}</TableCell>
                <TableCell>{candidate.name}</TableCell>
                <TableCell>{candidate.email}</TableCell>
                <TableCell>{candidate.phone || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CandidateImportPreview;
