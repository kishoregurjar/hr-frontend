"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Check, X, Tag as TagIcon, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { questionSchema } from "../../validations/questionSchema";
import {
  DEFAULT_QUESTION,
  QUESTION_STATUS_OPTIONS,
  QUESTION_TYPE_OPTIONS,
} from "../../constants";
import QuestionOptionFields from "./QuestionOptionFields";
import {
  getQuestionCategories,
  createQuestionCategory,
  getQuestionTags,
  createQuestionTag,
} from "@/lib/api/questions";

const QuestionForm = ({
  defaultValues = DEFAULT_QUESTION,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = "Save Question",
}) => {
  // 1. State Management
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategoryLoading, setIsCreatingCategoryLoading] = useState(false);

  // Tag Management States
  const [tags, setTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [isCreatingTagLoading, setIsCreatingTagLoading] = useState(false);

  // 2. React Hook Form Setup with Zod
  const form = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues,
  });

  // 3. Category & Tag Lifecycle Fetcher
  useEffect(() => {
    let isMounted = true;
    setIsLoadingCategories(true);

    getQuestionCategories()
      .then((res) => {
        if (!isMounted) return;
        const categoryData = Array.isArray(res?.data) ? res.data : [];
        setCategories(categoryData);
      })
      .catch((err) => {
        console.error("Failed to load categories:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingCategories(false);
      });

    // Fetch Live Tags
    getQuestionTags()
      .then((res) => {
        if (!isMounted) return;
        const tagData = Array.isArray(res?.data) ? res.data : [];
        setTags(tagData);
      })
      .catch((err) => console.error("Failed to load tags:", err));

    return () => {
      isMounted = false;
    };
  }, [form]);

  // Handler for Inline Category Creation
  const handleCreateInlineCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;

    try {
      setIsCreatingCategoryLoading(true);
      const res = await createQuestionCategory({ name });
      const createdCat = res?.data;

      if (createdCat?.id) {
        setCategories((prev) => [...prev, createdCat]);
        form.setValue("categoryId", createdCat.id, { shouldValidate: true });
        form.setValue("category", createdCat.name || name);
        setNewCategoryName("");
        setIsCreatingCategory(false);
      }
    } catch (err) {
      console.error("Failed to create category inline:", err);
    } finally {
      setIsCreatingCategoryLoading(false);
    }
  };

  // Handler for Inline Tag Creation
  const handleCreateInlineTag = async () => {
    const name = newTagName.trim();
    if (!name) return;

    try {
      setIsCreatingTagLoading(true);
      const res = await createQuestionTag({ name });
      const createdTag = res?.data;

      if (createdTag?.id) {
        setTags((prev) => [...prev, createdTag]);
        setSelectedTagIds((prev) => [...prev, createdTag.id]);
        setNewTagName("");
        setIsCreatingTag(false);
      }
    } catch (err) {
      console.error("Failed to create tag inline:", err);
    } finally {
      setIsCreatingTagLoading(false);
    }
  };

  // Toggle Tag Selection
  const toggleTagSelection = (tagId) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  // 4. Form Submit Handler
  const submitHandler = (data) => {
    const validTagIds = selectedTagIds.filter((id) => !id.startsWith("cm_tag_"));
    onSubmit({
      ...data,
      tagIds: validTagIds.length > 0 ? validTagIds : undefined,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitHandler)} className="space-y-5 font-sans">
        {/* Question Prompt Textarea */}
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Question Prompt
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="Type the question prompt or problem statement..."
                  {...field}
                  className="rounded-xl border-slate-200 bg-slate-50/50 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition shadow-2xs resize-none"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Category & Difficulty Row */}
        <div className="grid gap-4 sm:grid-cols-2 items-start">
          {/* Category Selector */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Category
                  </FormLabel>
                  <button
                    type="button"
                    onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    {isCreatingCategory ? "Cancel" : "New"}
                  </button>
                </div>

                {isCreatingCategory && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-50/60 border border-blue-200">
                    <Input
                      placeholder="e.g. DevOps"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="h-8 text-xs bg-white rounded-lg border-blue-300"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCreateInlineCategory();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      disabled={!newCategoryName.trim() || isCreatingCategoryLoading}
                      onClick={handleCreateInlineCategory}
                      className="h-8 px-3 rounded-lg text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    >
                      {isCreatingCategoryLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                    </Button>
                  </div>
                )}

                <Select
                  value={field.value || ""}
                  onValueChange={(selectedId) => {
                    field.onChange(selectedId);
                    const catName = categories.find((c) => c.id === selectedId)?.name || "";
                    form.setValue("category", catName, { shouldValidate: true });
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-800">
                      {isLoadingCategories ? (
                        <div className="flex items-center gap-2 text-slate-400">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Loading...</span>
                        </div>
                      ) : (
                        <span className="truncate">
                          {categories.find((c) => String(c.id) === String(field.value))?.name || "Select Category"}
                        </span>
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="text-xs font-medium">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Difficulty Selector */}
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Difficulty
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-800">
                      <SelectValue placeholder="Select Difficulty" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Easy" className="text-xs font-medium">🟢 Easy</SelectItem>
                    <SelectItem value="Medium" className="text-xs font-medium">🟡 Medium</SelectItem>
                    <SelectItem value="Hard" className="text-xs font-medium">🔴 Hard</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* Tags (Skill Chips) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Skill Tags
            </label>
            <button
              type="button"
              onClick={() => setIsCreatingTag(!isCreatingTag)}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              {isCreatingTag ? "Cancel" : "Add Tag"}
            </button>
          </div>

          {isCreatingTag && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-50/60 border border-blue-200">
              <Input
                placeholder="e.g. Docker"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="h-8 text-xs bg-white rounded-lg border-blue-300"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateInlineTag();
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                disabled={!newTagName.trim() || isCreatingTagLoading}
                onClick={handleCreateInlineTag}
                className="h-8 px-3 rounded-lg text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                {isCreatingTagLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-slate-200 bg-slate-50/40 min-h-[44px]">
            {tags.length === 0 ? (
              <span className="text-[11px] text-slate-400 font-medium self-center">
                No tags added yet. Click &apos;Add Tag&apos; to create one.
              </span>
            ) : (
              tags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <Badge
                    key={tag.id}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer text-[11px] font-bold transition-all py-1 px-2.5 rounded-lg select-none ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                    onClick={() => toggleTagSelection(tag.id)}
                  >
                    {tag.name}
                    {isSelected && <span className="ml-1 text-[10px]">✕</span>}
                  </Badge>
                );
              })
            )}
          </div>
        </div>

        {/* Type & Correct Answer Row */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Question Type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Question Type
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-800">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl">
                    {QUESTION_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-xs font-medium">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Correct Answer Target */}
          <FormField
            control={form.control}
            name="correctAnswer"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  Correct Option
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="h-10 rounded-xl border-emerald-300 bg-emerald-50/50 text-xs font-bold text-emerald-900">
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="optionA" className="text-xs font-bold text-emerald-800">Option A</SelectItem>
                    <SelectItem value="optionB" className="text-xs font-bold text-emerald-800">Option B</SelectItem>
                    <SelectItem value="optionC" className="text-xs font-bold text-emerald-800">Option C</SelectItem>
                    <SelectItem value="optionD" className="text-xs font-bold text-emerald-800">Option D</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* Options Grid */}
        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Answer Choices (A, B, C, D)
          </label>
          <QuestionOptionFields form={form} />
        </div>

        {/* Dialog Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-10 px-4 rounded-xl border-slate-200 text-xs font-bold"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-10 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving...
              </span>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default QuestionForm;