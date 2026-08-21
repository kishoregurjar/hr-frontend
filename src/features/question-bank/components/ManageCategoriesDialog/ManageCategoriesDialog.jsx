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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
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
        <Button variant="outline" className="gap-2">
          <FolderPlus className="h-4 w-4 text-slate-600" />
          Manage Categories
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Tags className="h-5 w-5 text-blue-600" />
            Manage Question Categories
          </DialogTitle>
          <DialogDescription>
            Create, rename, or delete question categories for your assessments.
          </DialogDescription>
        </DialogHeader>

        {/* Create Category Input Form */}
        <form onSubmit={handleCreate} className="flex gap-2 pt-2">
          <Input
            placeholder="e.g. System Design, DevOps, React"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={createMutation.isPending}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={createMutation.isPending || !newName.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="mr-1.5 h-4 w-4" />
                Add
              </>
            )}
          </Button>
        </form>

        {/* Categories List */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Existing Categories ({categories.length})
          </h4>

          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-sm text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-600" />
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">
              No categories found. Add your first category above!
            </div>
          ) : (
            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-slate-50/60 p-2.5 transition-colors hover:bg-slate-100/70"
                >
                  {editingId === cat.id ? (
                    <div className="flex flex-1 items-center gap-2">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="h-8 text-sm"
                        autoFocus
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-green-600 hover:bg-green-50"
                        onClick={() => handleSaveEdit(cat.id)}
                        disabled={updateMutation.isPending}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-slate-500 hover:bg-slate-200"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {cat.name}
                        </p>
                        {cat.description && (
                          <p className="truncate text-xs text-slate-500">
                            {cat.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-slate-500 hover:text-slate-900"
                          onClick={() => handleStartEdit(cat)}
                          title="Rename Category"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleDelete(cat.id, cat.name)}
                          disabled={deleteMutation.isPending}
                          title="Delete Category"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageCategoriesDialog;
