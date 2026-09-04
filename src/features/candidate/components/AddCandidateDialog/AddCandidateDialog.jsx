"use client";

import { useState } from "react";
import { Plus, UserPlus, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useCreateCandidate } from "../../hooks";
import CandidateForm from "../CandidateForm";

const AddCandidateDialog = ({ trigger }) => {
  const [open, setOpen] = useState(false);
  const createCandidate = useCreateCandidate();

  const handleOpenChange = (nextOpen) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      createCandidate.reset();
    }
  };

  const handleSubmit = (values) => {
    createCandidate.mutate(values, {
      onSuccess: () => {
        toast.success("Candidate added successfully!", {
          description: `${values.name || "Candidate"} has been added to your candidate directory.`,
        });
        setOpen(false);
      },
      onError: (err) => {
        toast.error(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to add candidate. Please try again."
        );
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            type="button"
            className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9 px-4 rounded-xl shadow-xs shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Candidate
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-2xl border border-slate-200/90 shadow-2xl font-sans bg-white">
        {/* ── 1. SIGNATURE EXECUTIVE HEADER ── */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center font-bold text-white shadow-sm shrink-0">
              <UserPlus className="h-5 w-5 text-blue-300" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-black tracking-tight text-white">
                  Add Candidate
                </DialogTitle>
                <span className="text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded">
                  New Profile
                </span>
              </div>
              <DialogDescription className="text-xs text-slate-300 font-medium leading-relaxed">
                Add applicant credentials to prepare invitations and screening tests.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* ── 2. FORM BODY ── */}
        <div className="p-6">
          <CandidateForm
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
            isSubmitting={createCandidate.isPending}
            error={createCandidate.error}
            resetSignal={open}
            submitLabel="Create Candidate"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCandidateDialog;
