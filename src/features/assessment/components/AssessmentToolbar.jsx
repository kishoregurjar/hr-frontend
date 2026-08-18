import { Search, SlidersHorizontal } from "lucide-react";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";

const AssessmentToolbar = () => {
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 lg:flex-row lg:items-center">
      {/* Search */}

      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          placeholder="Search assessments..."
          className="pl-10"
        />
      </div>

      {/* Status */}

      <Select>
        <SelectTrigger className="w-full lg:w-44">
          <SelectValue placeholder="Status" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="published">Published</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>

      {/* Difficulty */}

      <Select>
        <SelectTrigger className="w-full lg:w-44">
          <SelectValue placeholder="Difficulty" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="easy">Easy</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="hard">Hard</SelectItem>
        </SelectContent>
      </Select>

      {/* Filter Button */}

      <Button variant="outline" className="gap-2">
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </Button>
    </div>
  );
};

export default AssessmentToolbar;
