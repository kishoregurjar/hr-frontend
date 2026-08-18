"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { candidateSchema } from "../../validations";

const DEFAULT_FORM_VALUES = {
  name: "",
  email: "",
  phone: "",
};

const CandidateForm = ({
  defaultValues = DEFAULT_FORM_VALUES,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = "Add Candidate",
  error = null,
  resetSignal,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(candidateSchema),
    defaultValues,
  });

  const initialName = defaultValues?.name ?? "";
  const initialEmail = defaultValues?.email ?? "";
  const initialPhone = defaultValues?.phone ?? "";

  useEffect(() => {
    if (resetSignal) {
      reset({
        name: initialName,
        email: initialEmail,
        phone: initialPhone,
      });
    }
  }, [resetSignal, reset, initialName, initialEmail, initialPhone]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="candidate-name">
          Name
          <span className="text-destructive">*</span>
        </Label>

        <Input
          id="candidate-name"
          placeholder="Rahul Sharma"
          {...register("name")}
        />

        {errors.name && (
          <p className="text-sm text-destructive font-medium">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="candidate-email">
          Email
          <span className="text-destructive">*</span>
        </Label>

        <Input
          id="candidate-email"
          type="email"
          placeholder="rahul@example.com"
          {...register("email")}
        />

        {errors.email && (
          <p className="text-sm text-destructive font-medium">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="candidate-phone">Phone</Label>

        <Input
          id="candidate-phone"
          type="tel"
          placeholder="+91 9876543210"
          {...register("phone")}
        />

        {errors.phone && (
          <p className="text-sm text-destructive font-medium">
            {errors.phone.message}
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3">
          <p className="text-sm text-destructive font-medium">
            {error.message || "Unable to save candidate."}
          </p>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default CandidateForm;
