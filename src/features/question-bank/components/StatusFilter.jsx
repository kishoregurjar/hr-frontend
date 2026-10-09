import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QUESTION_STATUS_OPTIONS } from "../constants";

const StatusFilter = ({ value, onChange, className = "w-full sm:w-[160px] md:w-[180px]" }) => {
  const currentOption = QUESTION_STATUS_OPTIONS.find((opt) => opt.value === value);
  const displayLabel = currentOption
    ? currentOption.value === "all"
      ? "All Statuses"
      : currentOption.label
    : "All Statuses";

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="All Statuses">
          {displayLabel}
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        {QUESTION_STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.value === "all" ? "All Statuses" : option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default StatusFilter;
