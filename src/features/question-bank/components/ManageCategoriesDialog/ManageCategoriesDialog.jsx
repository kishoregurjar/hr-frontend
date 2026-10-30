"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  FolderPlus,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Check,
  X,
  Tags,
  FolderOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  useCategoriesQuery,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../../hooks";

const ManageCategoriesDialog = () => {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const { data: categories = [], isLoading } = useCategoriesQuery();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("Please enter a category name.");
      return;
    }

    createMutation.mutate(
      { name: newName.trim(), description: `${newName.trim()} questions` },
      {
        onSuccess: () => {
          toast.success("Category created successfully!");
          setNewName("");
        },
        onError: (err) => {
          toast.error(err?.message || "Failed to create category");
        },
      }
    );
  };

  const handleStartEdit = (cat) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleSaveEdit = (id) => {
    if (!editingName.trim()) {
      toast.error("Category name cannot be empty.");
      return;
    }

    updateMutation.mutate(
      { id, payload: { name: editingName.trim() } },
      {
        onSuccess: () => {
          toast.success("Category updated successfully!");
          setEditingId(null);
          setEditingName("");
        },
        onError: (err) => {
          toast.error(err?.message || "Failed to update category");
        },
      }
    );
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast.success("Category deleted successfully!");
        },
        onError: (err) => {
          toast.error(err?.message || "Failed to delete category");
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-1.5 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-semibold text-xs h-9 px-3.5 rounded-xl shadow-2xs cursor-pointer transition"
        >
          <FolderPlus className="h-4 w-4 text-indigo-600" />
          Manage Categories
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-3xl border border-white/90 shadow-2xl font-sans bg-white max-h-[90vh] flex flex-col">
        {/* ── 1. Top Hero Header with 3D Parallax Gradient ── */}
        <div className="shrink-0 bg-gradient-to-r from-[#4E35E8] via-[#6D38F0] to-[#CF2E9F] p-6 text-white rounded-t-3xl relative overflow-hidden select-none shadow-md">
          {/* Subtle Ambient 3D Glow Accents */}
          <div className="absolute -top-14 -right-14 h-40 w-40 rounded-full bg-white/15 blur-2xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 h-20 w-20 rounded-full bg-pink-300/10 blur-xl pointer-events-none" />

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
              <Tags className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-extrabold text-white tracking-tight drop-shadow-xs">
                Manage Question Categories
              </DialogTitle>
              <DialogDescription className="text-xs text-white/85 mt-0.5 font-medium">
                Create, rename, or delete question categories for your assessments.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* ── 2. Modal Body with Zero Ugly Scrollbars ── */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Create Category Input Form */}
          <form onSubmit={handleCreate} className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Add New Category
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. System Design, DevOps, React"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                disabled={createMutation.isPending}
                className="flex-1 h-10 text-xs font-medium rounded-xl border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs"
              />
              <Button
                type="submit"
                disabled={createMutation.isPending || !newName.trim()}
                className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 cursor-pointer transition-all flex items-center gap-1.5 shrink-0"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Categories List */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <span>Existing Categories</span>
                <span className="text-[10.5px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2 py-0.5 rounded-full shadow-2xs">
                  {categories.length}
                </span>
              </h4>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-10 text-xs font-semibold text-slate-500 gap-2 bg-slate-50/50 rounded-2xl border border-slate-200/60">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                <span>Loading categories...</span>
              </div>
            ) : categories.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-xs font-medium text-slate-500">
                <FolderOpen className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                No categories found. Add your first category above!
              </div>
            ) : (
              <div className="max-h-72 space-y-2 overflow-y-auto pr-0.5 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/80 p-2.5 px-3 transition-all shadow-2xs hover:shadow-xs"
                  >
                    {editingId === cat.id ? (
                      <div className="flex flex-1 items-center gap-2 animate-in fade-in-50">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSaveEdit(cat.id);
                            } else if (e.key === "Escape") {
                              setEditingId(null);
                            }
                          }}
                          className="h-8 text-xs font-bold rounded-lg border-indigo-300 bg-white focus-visible:ring-indigo-500"
                          autoFocus
                        />
                        <Button
                          size="icon"
                          type="button"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
                          onClick={() => handleSaveEdit(cat.id)}
                          disabled={updateMutation.isPending}
                          title="Save Changes"
                        >
                          {updateMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 stroke-[3]" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          type="button"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                          onClick={() => setEditingId(null)}
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="h-7 w-7 rounded-lg bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                            #
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-slate-800">
                              {cat.name}
                            </p>
                            {cat.description && (
                              <p className="truncate text-[11px] text-slate-400 font-medium">
                                {cat.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            className="h-7 w-7 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center transition cursor-pointer"
                            onClick={() => handleStartEdit(cat)}
                            title="Rename Category"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            className="h-7 w-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition cursor-pointer"
                            onClick={() => handleDelete(cat.id, cat.name)}
                            disabled={deleteMutation.isPending}
                            title="Delete Category"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── 3. Footer ── */}
        <div className="p-3.5 px-6 border-t border-slate-100 bg-slate-50/70 shrink-0 flex items-center justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
            className="h-9 px-5 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer transition shadow-2xs"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageCategoriesDialog;
