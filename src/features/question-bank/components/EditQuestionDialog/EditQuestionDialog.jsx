"use client";

import { useMemo, useState } from "react";
import { Pencil, HelpCircle } from "lucide-react";
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
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2.5 rounded-xl border-slate-200 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold gap-1 shadow-2xs cursor-pointer transition"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl border-slate-200/90 shadow-2xl font-sans bg-white max-h-[90vh] flex flex-col">
        {/* Light Header Matching HireQuest UI */}
        <div className="p-6 pb-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-blue-50 border border-blue-100/80 text-blue-600 flex items-center justify-center font-bold shadow-xs shrink-0">
              <Pencil className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-extrabold text-slate-900 tracking-tight">
                Edit Assessment Question
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Update prompt wording, category taxonomy, and evaluated answers.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <QuestionForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
            isSubmitting={updateQuestion.isPending}
            submitLabel="Update Question"
          />

          {updateQuestion.isError && (
            <p className="text-xs font-semibold text-rose-600 mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200">
              {updateQuestion.error?.message || "Unable to update question."}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuestionDialog;
