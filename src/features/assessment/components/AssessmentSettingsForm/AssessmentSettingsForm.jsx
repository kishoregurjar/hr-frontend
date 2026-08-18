"use client";

import { useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";

import { assessmentSettingsSchema } from "../../validations";

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
      showResultToCandidate:
        defaultValues?.showResultToCandidate ?? false,
    },
  });

  // Restore values when navigating back
  useEffect(() => {
    form.reset({
      duration: defaultValues?.duration ?? 60,
      passingScore: defaultValues?.passingScore ?? 70,
      attemptsAllowed: defaultValues?.attemptsAllowed ?? 1,
      shuffleQuestions: defaultValues?.shuffleQuestions ?? true,
      showResultToCandidate:
        defaultValues?.showResultToCandidate ?? false,
    });
  }, [defaultValues, form]);

  // Immediately persist changes to wizard state
  useEffect(() => {
    const subscription = form.watch((values) => {
      onChange?.(values);
    });

    return () => subscription.unsubscribe();
  }, [form, onChange]);

  const handleSubmit = (data) => {
    onContinue(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-8"
      >
        <div>
          <h2 className="text-xl font-semibold">
            Assessment Settings
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Configure how candidates will take this assessment.
          </p>
        </div>

        {/* Numeric Fields */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Duration */}
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration</FormLabel>

                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      min={5}
                      max={300}
                      {...field}
                      className="pr-20"
                    />

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      minutes
                    </span>
                  </div>
                </FormControl>

                <FormDescription>
                  Total time available to complete the assessment.
                </FormDescription>

                <FormMessage />
              </FormItem>
            )}
          />

          {/* Passing Score */}
          <FormField
            control={form.control}
            name="passingScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Passing Score</FormLabel>

                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      {...field}
                      className="pr-10"
                    />

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      %
                    </span>
                  </div>
                </FormControl>

                <FormDescription>
                  Minimum score required to pass.
                </FormDescription>

                <FormMessage />
              </FormItem>
            )}
          />

          {/* Attempts Allowed */}
          <FormField
            control={form.control}
            name="attemptsAllowed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Attempts Allowed</FormLabel>

                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    {...field}
                  />
                </FormControl>

                <FormDescription>
                  Number of times a candidate can attempt this assessment.
                </FormDescription>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Toggle Settings */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="shuffleQuestions"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <FormLabel>Shuffle Questions</FormLabel>

                  <FormDescription>
                    Show questions in a different order for each candidate.
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
              <FormItem className="flex items-center justify-between gap-6 rounded-lg border p-4">
                <div className="space-y-1">
                  <FormLabel>Show Result to Candidate</FormLabel>

                  <FormDescription>
                    Allow candidates to see their result after submission.
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

        {/* Navigation */}
        <div className="flex items-center justify-between border-t pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
          >
            Back
          </Button>

          <Button type="submit">Continue</Button>
        </div>
      </form>
    </Form>
  );
};

export default AssessmentSettingsForm;
