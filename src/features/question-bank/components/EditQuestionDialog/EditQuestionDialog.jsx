"use client";

import { useMemo, useState } from "react";
import { Pencil } from "lucide-react";
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
import { useUpdateQuestion } from "../../hooks";
import {
  transformQuestionFormToPayload,
  transformQuestionToForm,
} from "../../utils";
import QuestionForm from "../QuestionForm";

const EditQuestionDialog = ({ question }) => {
  const [open, setOpen] = useState(false);
  const updateQuestion = useUpdateQuestion();

  const defaultValues = useMemo(
    () => transformQuestionToForm(question),
    [question]
  );

  const handleSubmit = (formData) => {
    const payload = transformQuestionFormToPayload(formData);

    updateQuestion.mutate(
      {
        id: question.id,
        data: payload,
      },
      {
        onSuccess: () => {
          toast.success("Question updated successfully!");
          setOpen(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="min-w-[100px] flex-1">
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription>
            Update the question details and save your changes.
          </DialogDescription>
        </DialogHeader>

        <QuestionForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          isSubmitting={updateQuestion.isPending}
          submitLabel="Update Question"
        />

        {updateQuestion.isError && (
          <p className="text-sm text-destructive mt-2">
            {updateQuestion.error?.message || "Unable to update question."}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditQuestionDialog;
