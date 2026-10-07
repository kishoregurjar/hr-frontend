"use client";

import { Trash2, AlertTriangle } from "lucide-react";
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
} from "@/components/ui/alert-dialog";

const BulkDeleteAssessmentDialog = ({
  open,
  onOpenChange,
  count = 0,
  isAll = false,
  onConfirm,
  isPending = false,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[460px] p-6 rounded-2xl border border-slate-200 shadow-2xl font-sans">
        <AlertDialogHeader className="space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 shadow-xs mx-auto sm:mx-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <AlertDialogTitle className="text-lg font-extrabold text-slate-900">
            {isAll
              ? "Permanently delete all assessments?"
              : `Permanently delete ${count} selected assessment${count === 1 ? "" : "s"}?`}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <span>
              {isAll
                ? "This will permanently remove all assessments, candidate test sessions, and associated invitations from the database. This is a HARD DELETE and cannot be restored."
                : `Are you sure you want to permanently delete the ${count} selected assessment${count === 1 ? "" : "s"}? All related test attempts and invitations will also be removed from the database.`}
            </span>
            <span className="block font-bold text-rose-600">
              This action cannot be undone.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4 gap-2 sm:gap-2.5">
          <AlertDialogCancel
            disabled={isPending}
            className="rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm?.();
            }}
            disabled={isPending || (count === 0 && !isAll)}
            className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold gap-2 px-4 shadow-sm cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {isPending
              ? "Deleting..."
              : isAll
              ? "Yes, Delete All Permanently"
              : `Delete ${count} Assessment${count === 1 ? "" : "s"}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BulkDeleteAssessmentDialog;
