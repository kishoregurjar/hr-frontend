"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ResultFilters = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  decision,
  onDecisionChange,
}) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search candidate by name or email..."
        className="sm:max-w-sm"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Invited">Invited</SelectItem>
          </SelectContent>
        </Select>

        <Select value={decision} onValueChange={onDecisionChange}>
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="All Decisions" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Decisions</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Shortlisted">Shortlisted</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ResultFilters;
