"use client";

import { useState } from "react";
import { Plus, HelpCircle } from "lucide-react";
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
        <Button className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5 shadow-sm shadow-blue-500/20 cursor-pointer">
          <Plus className="h-4 w-4" />
          Add Question
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl border-slate-200 shadow-2xl font-sans bg-white max-h-[90vh] flex flex-col">
        {/* Executive Gradient Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center font-black shadow-inner">
              <HelpCircle className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-extrabold text-white tracking-tight">
                Add New Question
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-300 mt-0.5">
                Configure MCQ, problem-solving, or cognitive questions for your question bank.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <QuestionForm
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
            isSubmitting={createQuestion.isPending}
          />

          {createQuestion.isError && (
            <p className="text-xs font-semibold text-rose-600 mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200">
              {createQuestion.error?.message || "Unable to create question."}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddQuestionDialog;
