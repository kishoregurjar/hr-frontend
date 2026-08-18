"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

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
        <Button type="button">
          <Pencil className="mr-2 h-4 w-4" />
          Edit Candidate
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Candidate</DialogTitle>
          <DialogDescription>
            Update candidate information.
          </DialogDescription>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  );
};

export default EditCandidateDialog;
