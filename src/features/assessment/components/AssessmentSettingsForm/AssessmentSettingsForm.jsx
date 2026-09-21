"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Trophy, Repeat, Shuffle, Eye, ArrowLeft, ArrowRight } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";

import { assessmentSettingsSchema } from "../../validations";

const safeNumber = (val, fallback) => {
  const n = Number(val);
  return isNaN(n) ? fallback : n;
};

const AssessmentSettingsForm = ({
  defaultValues,
  onChange,
  onBack,
  onContinue,
}) => {
  const form = useForm({
    resolver: zodResolver(assessmentSettingsSchema),
    defaultValues: {
      duration: defaultValues?.duration ?? 60,
      passingScore: defaultValues?.passingScore ?? 70,
      attemptsAllowed: defaultValues?.attemptsAllowed ?? 1,
      shuffleQuestions: defaultValues?.shuffleQuestions ?? true,
      showResultToCandidate: defaultValues?.showResultToCandidate ?? false,
    },
  });

  useEffect(() => {
    form.reset({
      duration: defaultValues?.duration ?? 60,
      passingScore: defaultValues?.passingScore ?? 70,
      attemptsAllowed: defaultValues?.attemptsAllowed ?? 1,
      shuffleQuestions: defaultValues?.shuffleQuestions ?? true,
      showResultToCandidate: defaultValues?.showResultToCandidate ?? false,
    });
  }, [defaultValues, form]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      onChange?.(values);
    });
    return () => subscription.unsubscribe();
  }, [form, onChange]);

  const handleSubmit = (data) => {
    onContinue({
      ...data,
      duration: safeNumber(data.duration, 60),
      passingScore: safeNumber(data.passingScore, 70),
      attemptsAllowed: safeNumber(data.attemptsAllowed, 1),
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs font-sans space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Assessment & Proctoring Settings
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Configure timing constraints, pass benchmarks, and candidate feedback rules.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Numeric Fields Row */}
          <div className="grid gap-5 sm:grid-cols-3">
            {/* Duration */}
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-blue-600" />
                    Total Duration
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        min={5}
                        max={300}
                        {...field}
                        className="h-10 rounded-xl border-slate-200 bg-slate-50/50 pr-16 text-xs font-bold text-slate-900 focus:bg-white"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                        mins
                      </span>
                    </div>
                  </FormControl>
                  <FormDescription className="text-[11px] text-slate-500">
                    Max test time allowed.
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Passing Score */}
            <FormField
              control={form.control}
              name="passingScore"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5 text-amber-500" />
                    Passing Mark
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        {...field}
                        className="h-10 rounded-xl border-slate-200 bg-slate-50/50 pr-10 text-xs font-bold text-slate-900 focus:bg-white"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                        %
                      </span>
                    </div>
                  </FormControl>
                  <FormDescription className="text-[11px] text-slate-500">
                    Qualification threshold.
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Attempts Allowed */}
            <FormField
              control={form.control}
              name="attemptsAllowed"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Repeat className="h-3.5 w-3.5 text-indigo-600" />
                    Max Retries
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      {...field}
                      className="h-10 rounded-xl border-slate-200 bg-slate-50/50 text-xs font-bold text-slate-900 focus:bg-white"
                    />
                  </FormControl>
                  <FormDescription className="text-[11px] text-slate-500">
                    Candidate attempt limit.
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          {/* Toggle Switches */}
          <div className="space-y-3 pt-2">
            <FormField
              control={form.control}
              name="shuffleQuestions"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition hover:bg-slate-50">
                  <div className="space-y-0.5">
                    <FormLabel className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                      <Shuffle className="h-3.5 w-3.5 text-blue-600" />
                      Randomize Question Order
                    </FormLabel>
                    <FormDescription className="text-[11px] text-slate-500">
                      Shuffles MCQ question sequences dynamically to prevent collusion.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="showResultToCandidate"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition hover:bg-slate-50">
                  <div className="space-y-0.5">
                    <FormLabel className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                      <Eye className="h-3.5 w-3.5 text-emerald-600" />
                      Candidate Scorecard Visibility
                    </FormLabel>
                    <FormDescription className="text-[11px] text-slate-500">
                      Allow candidates to view their provisional score breakdown immediately after submission.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="h-10 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Back
            </Button>

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

export default AssessmentSettingsForm;
