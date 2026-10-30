"use client";

import { useEffect } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { assessmentDetailsSchema } from "../../validations";

const AssessmentDetailsForm = ({
  defaultValues,
  onContinue,
}) => {
  const form = useForm({
    resolver: zodResolver(assessmentDetailsSchema),

    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
    });
  }, [defaultValues, form]);

  const handleSubmit = (data) => {
    onContinue(data);
  };

  return (
    <div className="rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-6 sm:p-8 shadow-[0_12px_30px_rgba(79,70,229,0.08),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 font-sans space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          Assessment Details
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Give the assessment a clear title and description that HR and hiring teams can easily identify.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Assessment Title <span className="text-rose-500">*</span>
                </FormLabel>

                <FormControl>
                  <Input
                    placeholder="e.g. Senior Frontend Developer Assessment"
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/60 focus:bg-white text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    {...field}
                  />
                </FormControl>

                <FormDescription className="text-xs text-slate-500">
                  Give the assessment a clear name that HR can easily identify.
                </FormDescription>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Description
                </FormLabel>

                <FormControl>
                  <Textarea
                    rows={5}
                    placeholder="Describe the purpose, target role, or competencies this assessment evaluates..."
                    className="rounded-xl border-slate-200 bg-slate-50/60 focus:bg-white text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-y"
                    {...field}
                  />
                </FormControl>

                <FormDescription className="text-xs text-slate-500">
                  Optional. Add context about the role or skills this assessment evaluates.
                </FormDescription>

                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end border-t border-slate-100 pt-6">
            <Button
              type="submit"
              className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 shadow-sm shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <span>Continue to Games</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AssessmentDetailsForm;
