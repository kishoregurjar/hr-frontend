"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Phone, Loader2, UserPlus } from "lucide-react";

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-sans">
      {/* Full Name */}
      <div className="space-y-1.5">
        <Label htmlFor="candidate-name" className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
          Full Name <span className="text-rose-500">*</span>
        </Label>
        <div className="relative">
          <User className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
          <Input
            id="candidate-name"
            placeholder="e.g. Rohit Panchal"
            className="h-10 pl-9.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/30 transition shadow-2xs"
            {...register("name")}
          />
        </div>
        {errors.name && (
          <p className="text-[11px] text-rose-600 font-bold mt-1">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email Address */}
      <div className="space-y-1.5">
        <Label htmlFor="candidate-email" className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
          Email Address <span className="text-rose-500">*</span>
        </Label>
        <div className="relative">
          <Mail className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
          <Input
            id="candidate-email"
            type="email"
            placeholder="e.g. rohit@hirequest.com"
            className="h-10 pl-9.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/30 transition shadow-2xs"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-[11px] text-rose-600 font-bold mt-1">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Phone Number */}
      <div className="space-y-1.5">
        <Label htmlFor="candidate-phone" className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
          Phone Number <span className="text-slate-400 font-normal text-[10px]">(Optional)</span>
        </Label>
        <div className="relative">
          <Phone className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
          <Input
            id="candidate-phone"
            type="tel"
            placeholder="e.g. +91 9876543210"
            className="h-10 pl-9.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/30 transition shadow-2xs"
            {...register("phone")}
          />
        </div>
        {errors.phone && (
          <p className="text-[11px] text-rose-600 font-bold mt-1">
            {errors.phone.message}
          </p>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
          <p className="text-xs text-rose-700 font-semibold">
            {error.message || "Unable to save candidate profile."}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="h-9 px-4 rounded-xl border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-9 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-blue-500/25 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <UserPlus className="h-3.5 w-3.5" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default CandidateForm;
