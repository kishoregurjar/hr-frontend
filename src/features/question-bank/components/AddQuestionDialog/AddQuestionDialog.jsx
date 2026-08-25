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

import { publishQuestion } from "@/lib/api/questions";

const AddQuestionDialog = () => {
  const [open, setOpen] = useState(false);
  const createQuestion = useCreateQuestion();

  const handleSubmit = (formData) => {
    const payload = transformQuestionFormToPayload(formData);

    createQuestion.mutate(payload, {
      onSuccess: async (res) => {
        const createdId = res?.data?.id || res?.id;
        if (createdId) {
          try {
            await publishQuestion(createdId);
          } catch {
            // Ignore publish fallback
          }
        }
        toast.success("Question created and published successfully!");
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} preventCloseOnClickOutside={true}>
      <DialogTrigger asChild>
        <Button className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5 shadow-sm shadow-blue-500/20">
          <Plus className="h-4 w-4" />
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
