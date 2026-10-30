"use client";

import { useState } from "react";
import { Pencil, UserCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useUpdateCandidate } from "../../hooks";
import CandidateForm from "../CandidateForm";

const EditCandidateDialog = ({ candidate }) => {
  const [open, setOpen] = useState(false);
  const updateCandidate = useUpdateCandidate(candidate.id);

  const handleOpenChange = (nextOpen) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      updateCandidate.reset();
    }
  };

  const handleSubmit = (values) => {
    updateCandidate.mutate(values, {
      onSuccess: () => {
        toast.success("Candidate updated successfully!");
        setOpen(false);
      },
      onError: (err) => {
        toast.error(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to update candidate."
        );
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2.5 rounded-xl border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold gap-1 cursor-pointer"
        >
          <Pencil className="h-3.5 w-3.5 text-slate-500" />
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-3xl border border-white/90 shadow-2xl font-sans bg-white">
        {/* ── 1. SIGNATURE GRADIENT HEADER ── */}
        <div className="bg-gradient-to-r from-[#4E35E8] via-[#6D38F0] to-[#CF2E9F] p-6 text-white relative overflow-hidden select-none">
          {/* Subtle Ambient Rings & Glow */}
          <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute top-2 right-10 w-24 h-24 rounded-full border border-white/15 pointer-events-none" />

          <div className="relative z-10 flex items-start gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-bold text-white shadow-inner shrink-0">
              <UserCheck className="h-5 w-5 text-white" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl font-extrabold tracking-tight text-white drop-shadow-xs">
                  Edit Candidate
                </DialogTitle>
                <span className="text-[10px] font-extrabold uppercase bg-white/20 text-white border border-white/30 px-2.5 py-0.5 rounded-full">
                  Update
                </span>
              </div>
              <DialogDescription className="text-xs text-white/85 font-medium leading-relaxed">
                Modify candidate credentials, contact details, or role tags.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* ── 2. FORM BODY ── */}
        <div className="p-6">
          <CandidateForm
            defaultValues={{
              name: candidate.name ?? "",
              email: candidate.email ?? "",
              phone: candidate.phone ?? "",
            }}
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
            isSubmitting={updateCandidate.isPending}
            submitLabel="Save Changes"
            error={updateCandidate.error}
            resetSignal={open}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditCandidateDialog;
