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
              <FormLabel>
                Assessment Title
              </FormLabel>

              <FormControl>
                <Input
                  placeholder="e.g. Frontend Developer Assessment"
                  {...field}
                />
              </FormControl>

              <FormDescription>
                Give the assessment a clear name that HR
                can easily identify.
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
              <FormLabel>
                Description
              </FormLabel>

              <FormControl>
                <Textarea
                  rows={5}
                  placeholder="Describe the purpose of this assessment..."
                  {...field}
                />
              </FormControl>

              <FormDescription>
                Optional. Add context about the role or
                skills this assessment evaluates.
              </FormDescription>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end border-t pt-6">
          <Button type="submit">
            Continue
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AssessmentDetailsForm;
