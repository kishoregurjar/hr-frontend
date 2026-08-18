"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
import { useCreateQuestion } from "../../hooks";
import { transformQuestionFormToPayload } from "../../utils";
import QuestionForm from "../QuestionForm";

const AddQuestionDialog = () => {
  const [open, setOpen] = useState(false);
  const createQuestion = useCreateQuestion();

  const handleSubmit = (formData) => {
    const payload = transformQuestionFormToPayload(formData);

    createQuestion.mutate(payload, {
      onSuccess: () => {
        toast.success("Question created successfully!");
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add New Question</DialogTitle>
          <DialogDescription>
            Create a new question for your question bank.
          </DialogDescription>
        </DialogHeader>

        <QuestionForm
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          isSubmitting={createQuestion.isPending}
        />

        {createQuestion.isError && (
          <p className="text-sm text-destructive mt-2">
            {createQuestion.error?.message || "Unable to create question."}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddQuestionDialog;
