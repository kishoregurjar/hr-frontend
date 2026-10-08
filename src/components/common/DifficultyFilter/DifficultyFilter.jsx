import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DIFFICULTY_OPTIONS } from "@/constants";

const DifficultyFilter = ({ value, onChange, placeholder = "All Difficulties", className = "w-full md:w-44" }) => {
  const currentOption = DIFFICULTY_OPTIONS.find((opt) => opt.value === value);
  const displayLabel = currentOption
    ? currentOption.value === "all"
      ? "All Difficulties"
      : currentOption.label
    : "All Difficulties";

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder}>
          {displayLabel}
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        {DIFFICULTY_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.value === "all" ? "All Difficulties" : option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default DifficultyFilter;
