"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Trophy, Repeat, ArrowLeft, ArrowRight, Sliders } from "lucide-react";

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
    <div className="rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-6 sm:p-8 shadow-[0_12px_30px_rgba(79,70,229,0.08),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 font-sans space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Sliders className="h-5 w-5 text-indigo-600" />
          Assessment & Proctoring Settings
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Configure timing constraints, pass benchmarks, and candidate evaluation rules.
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
                    <Clock className="h-3.5 w-3.5 text-indigo-600" />
                    Total Duration
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        min={5}
                        max={300}
                        {...field}
                        className="h-11 rounded-xl border-slate-200 bg-slate-50/60 pr-16 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                        mins
                      </span>
                    </div>
                  </FormControl>
                  <FormDescription className="text-[11px] text-slate-500">
                    Maximum test time allowed for candidate.
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
                        className="h-11 rounded-xl border-slate-200 bg-slate-50/60 pr-10 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                        %
                      </span>
                    </div>
                  </FormControl>
                  <FormDescription className="text-[11px] text-slate-500">
                    Minimum score required to qualify.
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
                    <Repeat className="h-3.5 w-3.5 text-purple-600" />
                    Max Retries
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      {...field}
                      className="h-11 rounded-xl border-slate-200 bg-slate-50/60 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </FormControl>
                  <FormDescription className="text-[11px] text-slate-500">
                    Number of test attempts permitted.
                  </FormDescription>
                  <FormMessage className="text-xs" />
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
              className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 shadow-sm shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <span>Continue to Review</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AssessmentSettingsForm;
