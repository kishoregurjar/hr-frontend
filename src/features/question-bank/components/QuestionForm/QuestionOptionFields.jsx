"use client";

import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const QuestionOptionFields = ({ form }) => {
  const options = [
    { name: "optionA", letter: "A", placeholder: "e.g. Option A value" },
    { name: "optionB", letter: "B", placeholder: "e.g. Option B value" },
    { name: "optionC", letter: "C", placeholder: "e.g. Option C value" },
    { name: "optionD", letter: "D", placeholder: "e.g. Option D value" },
  ];

  const currentCorrect = form.watch("correctAnswer");

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const isCorrect = currentCorrect === option.name;

        return (
          <FormField
            key={option.name}
            control={form.control}
            name={option.name}
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormControl>
                  <div className={`flex items-center rounded-xl border transition-all overflow-hidden ${
                    isCorrect
                      ? "border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20"
                      : "border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20"
                  }`}>
                    <span className={`h-10 w-10 shrink-0 flex items-center justify-center font-black text-xs border-r select-none ${
                      isCorrect
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      {option.letter}
                    </span>
                    <Input
                      placeholder={option.placeholder}
                      {...field}
                      className="h-10 border-0 bg-transparent px-3 text-xs font-semibold focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-slate-800"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      })}
    </div>
  );
};

export default QuestionOptionFields;
