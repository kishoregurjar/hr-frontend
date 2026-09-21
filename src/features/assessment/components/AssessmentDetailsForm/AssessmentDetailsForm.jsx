"use client";

import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
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
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs font-sans">
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
                  Assessment Title
                </FormLabel>

                <FormControl>
                  <Input
                    placeholder="e.g. Frontend Developer Assessment"
                    className="h-11 rounded-xl border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500/30"
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
                    placeholder="Describe the purpose of this assessment..."
                    className="rounded-xl border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500/30 resize-y"
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
              className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AssessmentDetailsForm;
