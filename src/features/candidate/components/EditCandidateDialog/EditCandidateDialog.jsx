"use client";

import { useState } from "react";
import { Pencil, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
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
        setOpen(false);
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

      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-2xl border border-slate-200/90 shadow-2xl font-sans bg-white">
        {/* ── 1. SIGNATURE EXECUTIVE HEADER ── */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center font-bold text-white shadow-sm shrink-0">
              <UserCheck className="h-5 w-5 text-blue-300" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-black tracking-tight text-white">
                  Edit Candidate
                </DialogTitle>
                <span className="text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded">
                  Update
                </span>
              </div>
              <DialogDescription className="text-xs text-slate-300 font-medium leading-relaxed">
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
