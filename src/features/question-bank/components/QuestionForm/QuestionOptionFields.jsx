import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const QuestionOptionFields = ({ form }) => {
  const options = [
    { name: "optionA", label: "Option A" },
    { name: "optionB", label: "Option B" },
    { name: "optionC", label: "Option C" },
    { name: "optionD", label: "Option D" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {options.map((option) => (
        <FormField
          key={option.name}
          control={form.control}
          name={option.name}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder={option.label}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  );
};

export default QuestionOptionFields;
