"use client";

import { useMemo, useState } from "react";
import { Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
          className="h-8 px-2.5 rounded-xl border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold gap-1 shadow-2xs cursor-pointer transition"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl border border-white/90 shadow-2xl font-sans bg-white max-h-[90vh] flex flex-col">
        {/* ── 1. Top Hero Header with 3D Parallax Gradient ── */}
        <div className="shrink-0 bg-gradient-to-r from-[#4E35E8] via-[#6D38F0] to-[#CF2E9F] p-6 text-white rounded-t-3xl relative overflow-hidden select-none shadow-md">
          {/* Subtle Ambient 3D Glow Accents */}
          <div className="absolute -top-16 -right-16 h-44 w-44 rounded-full bg-white/15 blur-2xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 h-24 w-24 rounded-full bg-pink-300/10 blur-xl pointer-events-none" />

          {/* Close Button on Top Right */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer z-20"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3.5 relative z-10 pr-8">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center font-bold shadow-inner shrink-0">
              <Pencil className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-extrabold text-white tracking-tight drop-shadow-xs">
                Edit Assessment Question
              </DialogTitle>
              <DialogDescription className="text-xs text-white/85 mt-0.5 font-medium">
                Update prompt wording, category taxonomy, and evaluated answer choices.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* ── 2. Scrollable Form with No-Scrollbar ── */}
        <div className="p-6 overflow-y-auto flex-1 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
