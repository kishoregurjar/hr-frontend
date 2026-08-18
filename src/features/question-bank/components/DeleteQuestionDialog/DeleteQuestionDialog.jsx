"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeleteQuestion } from "../../hooks";

const DeleteQuestionDialog = ({ question }) => {
  const deleteQuestion = useDeleteQuestion();

  const handleDelete = () => {
    deleteQuestion.mutate(question.id, {
      onSuccess: () => {
        toast.success("Question deleted successfully!");
      },
      onError: (err) => {
        toast.error(err?.message || "Failed to delete question");
      },
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="min-w-[100px] flex-1"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete question?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{question.question}&quot;?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {deleteQuestion.isError && (
          <p className="text-sm text-destructive">
            {deleteQuestion.error?.message || "Unable to delete question."}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteQuestion.isPending}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteQuestion.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteQuestion.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteQuestionDialog;
