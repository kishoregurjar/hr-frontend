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
          <Button type="button">
            <Plus className="mr-2 h-4 w-4" />
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
