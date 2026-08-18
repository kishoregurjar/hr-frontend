import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BasicInformationSection = () => {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold">
          Basic Information
        </h2>

        <p className="text-sm text-muted-foreground">
          Enter the core details of your assessment.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Assessment Title</Label>
        <Input placeholder="Frontend Developer Assessment" />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          rows={5}
          placeholder="Describe the purpose of this assessment..."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">

        <div className="space-y-2">
          <Label>Difficulty</Label>

          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select Difficulty" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Duration (Minutes)</Label>

          <Input
            type="number"
            placeholder="45"
          />
        </div>

        <div className="space-y-2">
          <Label>Passing Score (%)</Label>

          <Input
            type="number"
            placeholder="60"
          />
        </div>

      </div>
    </div>
  );
};

export default BasicInformationSection;
