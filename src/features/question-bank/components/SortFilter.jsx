import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QUESTION_SORT_OPTIONS } from "@/constants";

const SortFilter = ({ value, onChange }) => {
  const currentOption = QUESTION_SORT_OPTIONS.find((opt) => opt.value === value);
  const displayLabel = currentOption ? currentOption.label : "Sort By: Latest";

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort By">
          {displayLabel}
        </SelectValue>
      </SelectTrigger>

      <SelectContent> 
        {QUESTION_SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SortFilter;
