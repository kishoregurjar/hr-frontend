import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SortFilter = ({ value, onChange }) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-52">
        <SelectValue placeholder="Sort By" />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="name-asc">Name (A → Z)</SelectItem>
        <SelectItem value="name-desc">Name (Z → A)</SelectItem>
        <SelectItem value="duration-asc">Duration (Low → High)</SelectItem>
        <SelectItem value="duration-desc">Duration (High → Low)</SelectItem>
        <SelectItem value="used-desc">Most Used</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default SortFilter;
