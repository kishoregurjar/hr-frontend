"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";

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

  // Tag Management States (Pure Live DB Tags — Zero Static Data)
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
        // getQuestionCategories returns { success, data: [...] } — res.data is already the array
        const categoryData = Array.isArray(res?.data) ? res.data : [];
        setCategories(categoryData);
        // Do NOT auto-select first category — let user choose explicitly
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
        // getQuestionTags returns { success, data: [...] } — res.data is already the array
        const tagData = Array.isArray(res?.data) ? res.data : [];
        setTags(tagData);
      })
      .catch((err) => console.error("Failed to load tags:", err));

    return () => {
      isMounted = false;
    };
  }, [form]);

  // Handler for Inline Category Creation (POST /api/v1/question-categories)
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

  // Handler for Inline Tag Creation (POST /api/v1/question-tags)
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

  const errorHandler = (errors) => {
    console.log("🔴 FRONTEND ZOD VALIDATION ERRORS:", errors);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitHandler, errorHandler)} className="space-y-6">
        {/* Question Input */}
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="Enter question text..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category & Difficulty Grid */}
        <div className="grid gap-4 md:grid-cols-2 items-start">
          {/* CATEGORY SELECT WITH INLINE CREATION */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between h-6 mb-1">
                  <FormLabel className="my-0">Category</FormLabel>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-primary hover:text-primary/80 px-1 font-medium"
                    onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {isCreatingCategory ? "Cancel" : "Add New Category"}
                  </Button>
                </div>

                {isCreatingCategory && (
                  <div className="flex items-center gap-2 mb-2 p-2 border rounded-md bg-muted/30">
                    <Input
                      placeholder="Category name (e.g. DevOps)"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="h-8 text-xs"
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
                      className="h-8 text-xs px-3"
                      disabled={!newCategoryName.trim() || isCreatingCategoryLoading}
                      onClick={handleCreateInlineCategory}
                    >
                      {isCreatingCategoryLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "Save"
                      )}
                    </Button>
                  </div>
                )}

                <Select
                  value={field.value || ""}
                  onValueChange={(selectedId) => {
                    field.onChange(selectedId);
                    // Also set category name so Zod validation never blocks
                    const catName = categories.find((c) => c.id === selectedId)?.name || "";
                    form.setValue("category", catName, { shouldValidate: true });
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      {isLoadingCategories ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Loading categories...</span>
                        </div>
                      ) : (
                        <span className="truncate text-foreground font-normal">
                          {categories.find((c) => String(c.id) === String(field.value))?.name || "Select Category"}
                        </span>
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No categories found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Difficulty Select */}
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between h-6 mb-1">
                  <FormLabel className="my-0">Difficulty</FormLabel>
                </div>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Difficulty" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Skill Tags Section with Inline "+ Add New Tag" */}
        <div className="space-y-2">
          <div className="flex items-center justify-between h-6">
            <label className="text-sm font-medium">Tags (Skill Chips)</label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-primary hover:text-primary/80 px-1 font-medium"
              onClick={() => setIsCreatingTag(!isCreatingTag)}
            >
              <Plus className="h-3 w-3 mr-1" />
              {isCreatingTag ? "Cancel" : "Add New Tag"}
            </Button>
          </div>

          {isCreatingTag && (
            <div className="flex items-center gap-2 mb-2 p-2 border rounded-md bg-muted/30">
              <Input
                placeholder="Tag name (e.g. GraphQL)"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="h-8 text-xs"
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
                className="h-8 text-xs px-3"
                disabled={!newTagName.trim() || isCreatingTagLoading}
                onClick={handleCreateInlineTag}
              >
                {isCreatingTagLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 p-2.5 border rounded-md min-h-[42px] bg-background">
            {tags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id);
              return (
                <Badge
                  key={tag.id}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer text-xs select-none transition-all hover:opacity-80 py-1 px-2.5"
                  onClick={() => toggleTagSelection(tag.id)}
                >
                  {tag.name}
                  {isSelected && <span className="ml-1 text-xs">✕</span>}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Type & Status Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {QUESTION_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {QUESTION_STATUS_OPTIONS.filter(
                      (option) => option.value !== "all"
                    ).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Correct Answer */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="correctAnswer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correct Answer</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select correct option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="optionA">Option A</SelectItem>
                    <SelectItem value="optionB">Option B</SelectItem>
                    <SelectItem value="optionC">Option C</SelectItem>
                    <SelectItem value="optionD">Option D</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Options Grid */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Options</label>
          <QuestionOptionFields form={form} />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default QuestionForm;