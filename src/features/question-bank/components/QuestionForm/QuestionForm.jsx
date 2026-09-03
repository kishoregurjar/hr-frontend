"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Check, X, Tag as TagIcon, Sparkles, ChevronDown, Search } from "lucide-react";

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
  const [selectedTagIds, setSelectedTagIds] = useState(
    Array.isArray(defaultValues.tagIds)
      ? defaultValues.tagIds
      : Array.isArray(defaultValues.tags)
      ? defaultValues.tags.map((t) => (typeof t === "object" ? t.id || t.name : t))
      : []
  );
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [isCreatingTagLoading, setIsCreatingTagLoading] = useState(false);

  // Tag Dropdown States
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const tagDropdownRef = useRef(null);

  // Close tag dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target)) {
        setIsTagDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync selectedTagIds when defaultValues changes (e.g. on question edit)
  useEffect(() => {
    if (Array.isArray(defaultValues.tagIds) && defaultValues.tagIds.length > 0) {
      setSelectedTagIds(defaultValues.tagIds);
    } else if (Array.isArray(defaultValues.tags) && defaultValues.tags.length > 0) {
      setSelectedTagIds(defaultValues.tags.map((t) => (typeof t === "object" ? t.id || t.name : t)));
    }
  }, [defaultValues]);

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

        {/* Skill Tags - Multi-Select Searchable Dropdown */}
        <div className="space-y-1.5" ref={tagDropdownRef}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Skill Tags
              </label>
              {selectedTagIds.length > 0 && (
                <span className="text-[10.5px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200/80 px-2 py-0.5 rounded-full shadow-2xs">
                  {selectedTagIds.length} Selected
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsCreatingTag(!isCreatingTag)}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              {isCreatingTag ? "Cancel" : "Add New Tag"}
            </button>
          </div>

          {/* Quick Inline Tag Creator */}
          {isCreatingTag && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-50/60 border border-blue-200 animate-in fade-in-50">
              <Input
                placeholder="Type new tag name (e.g. Docker, Redis)..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="h-8 text-xs bg-white rounded-lg border-blue-300 focus-visible:ring-blue-500"
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
                className="h-8 px-3 rounded-lg text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shrink-0"
              >
                {isCreatingTagLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save Tag"}
              </Button>
            </div>
          )}

          {/* Tag Dropdown Trigger & Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsTagDropdownOpen((prev) => !prev)}
              className={`w-full h-10 px-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                isTagDropdownOpen
                  ? "border-blue-500 ring-2 ring-blue-500/20 bg-white text-slate-900"
                  : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <TagIcon className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span className="truncate">
                  {selectedTagIds.length === 0
                    ? "Select skill tags..."
                    : `${selectedTagIds.length} tags selected`}
                </span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                  isTagDropdownOpen ? "rotate-180 text-blue-600" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu Box */}
            {isTagDropdownOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1.5 p-2 bg-white rounded-2xl border border-slate-200/90 shadow-xl space-y-2 animate-in fade-in-50 zoom-in-95">
                {/* Search Input */}
                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <Input
                    placeholder="Search tags..."
                    value={tagSearchQuery}
                    onChange={(e) => setTagSearchQuery(e.target.value)}
                    className="h-8 pl-8 pr-3 text-xs rounded-lg border-slate-200 bg-slate-50/60 focus:bg-white"
                    autoFocus
                  />
                  {tagSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setTagSearchQuery("")}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Scrollable Tag List (Fixed Max Height Prevents UI Breaking) */}
                <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
                  {tags
                    .filter((t) =>
                      (t.name || "").toLowerCase().includes(tagSearchQuery.toLowerCase())
                    )
                    .map((tag) => {
                      const isSelected =
                        selectedTagIds.includes(tag.id) || selectedTagIds.includes(tag.name);

                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTagSelection(tag.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                            isSelected
                              ? "bg-blue-50 text-blue-700 font-bold"
                              : "text-slate-700 hover:bg-slate-100/80"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className={`h-4 w-4 rounded-md flex items-center justify-center border text-[10px] shrink-0 transition-colors ${
                                isSelected
                                  ? "bg-blue-600 border-blue-600 text-white"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                            </span>
                            <span className="truncate">{tag.name}</span>
                          </div>
                          {isSelected && (
                            <span className="text-[10px] font-extrabold text-blue-600">
                              Selected
                            </span>
                          )}
                        </button>
                      );
                    })}

                  {tags.filter((t) =>
                    (t.name || "").toLowerCase().includes(tagSearchQuery.toLowerCase())
                  ).length === 0 && (
                    <div className="p-4 text-center space-y-2">
                      <p className="text-xs text-slate-400 font-medium">
                        No tags found matching &ldquo;{tagSearchQuery}&rdquo;
                      </p>
                      {tagSearchQuery.trim() && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setNewTagName(tagSearchQuery);
                            setIsCreatingTag(true);
                            setIsTagDropdownOpen(false);
                          }}
                          className="h-7 text-xs font-bold text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          + Create &ldquo;{tagSearchQuery}&rdquo;
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Selected Tags Chips Display Container */}
          {selectedTagIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-slate-200/80 bg-slate-50/50 max-h-24 overflow-y-auto">
              {tags
                .filter(
                  (t) => selectedTagIds.includes(t.id) || selectedTagIds.includes(t.name)
                )
                .map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1.5 bg-white border border-blue-200/90 text-blue-700 text-[11px] font-bold py-0.5 pl-2.5 pr-1.5 rounded-lg shadow-2xs"
                  >
                    <span className="truncate max-w-[120px]">{tag.name}</span>
                    <button
                      type="button"
                      onClick={() => toggleTagSelection(tag.id)}
                      className="h-4 w-4 rounded flex items-center justify-center hover:bg-blue-100 text-blue-500 hover:text-blue-800 transition cursor-pointer"
                      title="Remove tag"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
            </div>
          )}
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