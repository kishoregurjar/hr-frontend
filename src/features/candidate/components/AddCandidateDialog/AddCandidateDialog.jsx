"use client";

import { useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
    createCandidate.mutate(
      { ...values, source: "MANUAL" },
      {
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
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            type="button"
            className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9 px-4 rounded-xl shadow-xs shadow-indigo-500/20 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Candidate
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-3xl border border-white/90 shadow-2xl font-sans bg-white">
        {/* ── 1. SIGNATURE GRADIENT HEADER ── */}
        <div className="bg-gradient-to-r from-[#4E35E8] via-[#6D38F0] to-[#CF2E9F] p-6 text-white relative overflow-hidden select-none">
          {/* Subtle Ambient Rings & Glow */}
          <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute top-2 right-10 w-24 h-24 rounded-full border border-white/15 pointer-events-none" />

          <div className="relative z-10 flex items-start gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-bold text-white shadow-inner shrink-0">
              <UserPlus className="h-5 w-5 text-white" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl font-extrabold tracking-tight text-white drop-shadow-xs">
                  Add Candidate
                </DialogTitle>
                <span className="text-[10px] font-extrabold uppercase bg-white/20 text-white border border-white/30 px-2.5 py-0.5 rounded-full">
                  New Profile
                </span>
              </div>
              <DialogDescription className="text-xs text-white/85 font-medium leading-relaxed">
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
