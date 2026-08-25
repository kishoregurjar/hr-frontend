"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

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
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            type="button"
            className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-10 px-4 rounded-xl shadow-xs shadow-blue-500/20"
          >
            <Plus className="h-4 w-4" />
            Add Candidate
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Candidate</DialogTitle>

          <DialogDescription>
            Add a candidate to your candidate library.
          </DialogDescription>
        </DialogHeader>

        <CandidateForm
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          isSubmitting={createCandidate.isPending}
          error={createCandidate.error}
          resetSignal={open}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddCandidateDialog;
