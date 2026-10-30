"use client";

import { useState, useRef, useEffect } from "react";
import Papa from "papaparse";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  X,
  Trash2,
  RefreshCw,
  Search,
  Sparkles,
  Loader2,
  Check,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  autoDetectCategory,
  autoDetectDifficulty,
  autoExtractTags,
  detectCorrectOptionKey,
  getSampleCsvContent,
} from "../../utils/autoClassifier";
import { getQuestionCategories, getQuestionTags } from "@/lib/api/questions";
import { useBulkCreateQuestions } from "../../hooks";
import { useQueryClient } from "@tanstack/react-query";
import { QUESTION_QUERY_KEYS } from "../../constants/queryKeys";
import { questionsService } from "../../services";

const BulkQuestionImportDialog = () => {
  const [open, setOpen] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedRows, setParsedRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fileName, setFileName] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(null);

  // Seamless Inline Tag State
  const [inlineTagRowId, setInlineTagRowId] = useState(null);
  const [inlineTagValue, setInlineTagValue] = useState("");

  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();
  const bulkCreate = useBulkCreateQuestions();

  // Load existing categories and tags on open
  useEffect(() => {
    if (!open) return;

    getQuestionCategories()
      .then((res) => {
        const catData = Array.isArray(res?.data) ? res.data : [];
        setCategories(catData);
      })
      .catch((err) => console.error("Failed to fetch categories:", err));

    getQuestionTags()
      .then((res) => {
        const tagData = Array.isArray(res?.data) ? res.data : [];
        setTags(tagData);
      })
      .catch((err) => console.error("Failed to fetch tags:", err));
  }, [open]);

  // Reset dialog state on close
  const handleOpenChange = (newOpen) => {
    if (isImporting) return;
    setOpen(newOpen);
    if (!newOpen) {
      setParsedRows([]);
      setFileName("");
      setSearchQuery("");
      setImportProgress(null);
      setInlineTagRowId(null);
      setInlineTagValue("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Download Sample CSV
  const handleDownloadSample = () => {
    const csvContent = getSampleCsvContent();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "hirequest_questions_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Sample CSV template downloaded!");
  };

  // Handle CSV file selection and parsing
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsParsing(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: "greedy",
      dynamicTyping: false,
      complete: (results) => {
        setIsParsing(false);
        if (!results.data || results.data.length === 0) {
          toast.error("CSV file is empty or could not be parsed.");
          return;
        }

        processRawRows(results.data);
      },
      error: (error) => {
        setIsParsing(false);
        toast.error(`CSV Parsing error: ${error.message}`);
      },
    });
  };

  // Convert raw CSV rows to structured question records with auto-classification
  const processRawRows = (rawRows) => {
    // Filter out accidental empty/stray rows (e.g. single accidental letter with no options)
    const sanitizedRows = rawRows.filter((row) => {
      const q = String(
        row.question || row.Question || row.title || row.Title || row.prompt || row.Prompt || ""
      ).trim();
      const hasAnyOption = Boolean(
        row.optionA || row.OptionA || row.option_a || row.A || row.a ||
        row.optionB || row.OptionB || row.option_b || row.B || row.b
      );
      if (!hasAnyOption && q.length < 5) return false;
      return Boolean(q);
    });

    const processed = sanitizedRows.map((row, index) => {
      // Find question prompt
      const questionPrompt =
        row.question ||
        row.Question ||
        row.title ||
        row.Title ||
        row.prompt ||
        row.Prompt ||
        "";

      // Options
      const optionA = row.optionA || row.OptionA || row.option_a || row.A || row.a || "";
      const optionB = row.optionB || row.OptionB || row.option_b || row.B || row.b || "";
      const optionC = row.optionC || row.OptionC || row.option_c || row.C || row.c || "";
      const optionD = row.optionD || row.OptionD || row.option_d || row.D || row.d || "";

      const optionsList = [optionA, optionB, optionC, optionD].filter(Boolean);

      // Auto-Detect Category (Use CSV provided value if specified, else run classifier)
      const rawCategory = row.category || row.Category || "";
      const detectedCat = autoDetectCategory(
        questionPrompt,
        optionsList,
        categories
      );
      const categoryName = rawCategory ? rawCategory.trim() : detectedCat.name;
      const categoryId = detectedCat.id;

      // Auto-Detect Difficulty (Use CSV provided if specified, else run classifier)
      const rawDiff = row.difficulty || row.Difficulty || "";
      const detectedDiff = rawDiff
        ? rawDiff.charAt(0).toUpperCase() + rawDiff.slice(1).toLowerCase()
        : autoDetectDifficulty(questionPrompt, optionsList);

      // Auto-Detect Skill Tags (Combine CSV provided tags with auto-extracted tags)
      const csvTags = (row.tags || row.Tags || "")
        ? String(row.tags || row.Tags)
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];
      const extractedTags = autoExtractTags(questionPrompt, optionsList, tags);
      const combinedTags = Array.from(new Set([...csvTags, ...extractedTags])).slice(0, 5);

      // Detect Correct Option Key (supports all common header naming styles)
      const rawCorrect =
        row.correctAns ||
        row.CorrectAns ||
        row.correct_ans ||
        row.correctAnswer ||
        row.CorrectAnswer ||
        row.correctOption ||
        row.CorrectOption ||
        row.correct ||
        row.Correct ||
        row.answer ||
        row.Answer ||
        "";

      const matchedCorrectKey = detectCorrectOptionKey(rawCorrect, {
        optionA,
        optionB,
        optionC,
        optionD,
      });

      // Validation warnings
      const warnings = [];
      if (!questionPrompt || questionPrompt.trim().length < 8) {
        warnings.push("Question prompt is too short (< 8 chars).");
      }
      if (optionsList.length < 2) {
        warnings.push("At least 2 options are required.");
      }
      if (!matchedCorrectKey) {
        warnings.push("Correct answer missing or does not match options.");
      }

      return {
        id: `row-${index}-${Date.now()}`,
        index: index + 1,
        question: questionPrompt.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        optionC: optionC.trim(),
        optionD: optionD.trim(),
        category: categoryName,
        categoryId: categoryId,
        difficulty: ["Easy", "Medium", "Hard"].includes(detectedDiff) ? detectedDiff : "Medium",
        tags: combinedTags,
        correctAnswer: matchedCorrectKey || "optionA", // fallback to optionA if missing, flagged in warnings
        hasCorrectSpecified: Boolean(matchedCorrectKey),
        warnings,
        isValid: warnings.length === 0,
      };
    });

    setParsedRows(processed);
    toast.success(`Parsed ${processed.length} questions from CSV!`);
  };

  // Row update handlers
  const updateRowField = (id, field, value) => {
    setParsedRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const updated = { ...row, [field]: value };

        // Revalidate
        const warnings = [];
        if (!updated.question || updated.question.trim().length < 8) {
          warnings.push("Question prompt is too short.");
        }
        if (!updated.optionA || !updated.optionB) {
          warnings.push("At least Option A and Option B are required.");
        }
        if (!updated.correctAnswer) {
          warnings.push("Please select a correct answer.");
        }

        updated.warnings = warnings;
        updated.isValid = warnings.length === 0;
        return updated;
      })
    );
  };

  const deleteRow = (id) => {
    setParsedRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Seamless Inline Tag Addition
  const saveInlineTag = (rowId) => {
    const trimmed = inlineTagValue.trim();
    if (trimmed) {
      const targetRow = parsedRows.find((r) => r.id === rowId);
      if (targetRow && !targetRow.tags.includes(trimmed)) {
        updateRowField(rowId, "tags", [...targetRow.tags, trimmed]);
      }
    }
    setInlineTagRowId(null);
    setInlineTagValue("");
  };

  // Submit all valid rows to backend in batches
  const handleBulkImport = async () => {
    if (parsedRows.length === 0) {
      toast.error("No questions to import.");
      return;
    }

    const invalidCount = parsedRows.filter((r) => !r.isValid).length;
    if (invalidCount > 0) {
      toast.warning(
        `${invalidCount} questions have warnings. Please fix or remove them before importing.`
      );
      return;
    }

    // Format payload for backend
    const payload = parsedRows.map((r) => ({
      title: r.question,
      content: r.question,
      category: r.category,
      categoryId: r.categoryId,
      difficulty: r.difficulty.toUpperCase(),
      type: "SINGLE_CHOICE",
      status: "DRAFT",
      tags: r.tags,
      correctAnswer: r.correctAnswer,
      options: [
        { text: r.optionA, isCorrect: r.correctAnswer === "optionA", sequence: 1 },
        { text: r.optionB, isCorrect: r.correctAnswer === "optionB", sequence: 2 },
        ...(r.optionC ? [{ text: r.optionC, isCorrect: r.correctAnswer === "optionC", sequence: 3 }] : []),
        ...(r.optionD ? [{ text: r.optionD, isCorrect: r.correctAnswer === "optionD", sequence: 4 }] : []),
      ],
    }));

    const totalQuestions = payload.length;
    // Smart Dynamic Batching: <= 25 questions import in 1 call, otherwise smooth chunks of 20
    const CHUNK_SIZE = totalQuestions <= 25 ? totalQuestions : 20;
    const totalChunks = Math.ceil(totalQuestions / CHUNK_SIZE);

    setIsImporting(true);
    setImportProgress({
      current: 0,
      total: totalQuestions,
      percent: 0,
      currentBatch: 1,
      totalBatches: totalChunks,
    });

    let totalCreated = 0;
    let totalSkipped = 0;
    let totalFailed = 0;

    try {
      for (let i = 0; i < totalQuestions; i += CHUNK_SIZE) {
        const chunk = payload.slice(i, i + CHUNK_SIZE);
        const batchNum = Math.floor(i / CHUNK_SIZE) + 1;

        setImportProgress({
          current: i,
          total: totalQuestions,
          percent: Math.round((i / totalQuestions) * 100),
          currentBatch: batchNum,
          totalBatches: totalChunks,
        });

        // Resilient batch execution with 1 auto-retry if network blip occurs
        let res;
        let attempts = 0;
        const maxAttempts = 2;
        while (attempts < maxAttempts) {
          try {
            res = await questionsService.bulkCreate(chunk);
            break;
          } catch (batchErr) {
            attempts++;
            if (attempts >= maxAttempts) throw batchErr;
            // Short backoff before retry
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        const data = res?.data || res;

        totalCreated += data?.createdCount ?? (Array.isArray(data?.created) ? data.created.length : chunk.length);
        totalSkipped += data?.skippedCount ?? 0;
        totalFailed += data?.failedCount ?? 0;

        const processedCount = Math.min(i + chunk.length, totalQuestions);
        setImportProgress({
          current: processedCount,
          total: totalQuestions,
          percent: Math.round((processedCount / totalQuestions) * 100),
          currentBatch: batchNum,
          totalBatches: totalChunks,
        });
      }

      // Invalidate queries so Question Bank refreshes
      queryClient.invalidateQueries({
        queryKey: QUESTION_QUERY_KEYS.all,
      });

      let msg = `Successfully imported ${totalCreated} questions!`;
      if (totalSkipped > 0) {
        msg += ` (${totalSkipped} duplicates skipped)`;
      }
      if (totalFailed > 0) {
        msg += ` (${totalFailed} failed)`;
      }
      toast.success(msg);
      handleOpenChange(false);
    } catch (err) {
      console.error("Bulk import failed:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to bulk import questions.");
      queryClient.invalidateQueries({
        queryKey: QUESTION_QUERY_KEYS.all,
      });
    } finally {
      setIsImporting(false);
      setImportProgress(null);
    }
  };

  // Filtered rows for search
  const filteredRows = parsedRows.filter((r) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      r.question.toLowerCase().includes(query) ||
      r.category.toLowerCase().includes(query) ||
      r.tags.some((t) => t.toLowerCase().includes(query))
    );
  });

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const issueCount = parsedRows.length - validCount;

  // Format option letter to readable display
  const formatOptionLabel = (optKey) => {
    if (!optKey) return "Select";
    return `Option ${optKey.replace("option", "").toUpperCase()}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-9 px-3.5 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs gap-1.5 shadow-2xs cursor-pointer"
        >
          <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
          Bulk Import (CSV)
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-6xl p-0 overflow-hidden rounded-3xl border border-white/90 shadow-2xl font-sans bg-white max-h-[92vh] flex flex-col">
        {/* ── 1. Top Hero Header with 3D Parallax Gradient ── */}
        <div className="shrink-0 bg-gradient-to-r from-[#4E35E8] via-[#6D38F0] to-[#CF2E9F] p-6 text-white rounded-t-3xl relative overflow-hidden select-none shadow-md">
          {/* Subtle Ambient 3D Glow Accents */}
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/15 blur-2xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 h-28 w-28 rounded-full bg-pink-300/10 blur-xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center font-bold shadow-inner shrink-0">
                <FileSpreadsheet className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-xl font-extrabold text-white tracking-tight drop-shadow-xs">
                    Smart Bulk Question Ingestion
                  </DialogTitle>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-2xs">
                    <Sparkles className="h-3 w-3 text-pink-200" />
                    Auto-Classified
                  </span>
                </div>
                <DialogDescription className="text-xs text-white/85 mt-0.5 font-medium">
                  Upload CSV sheet. System automatically classifies Category, Difficulty, and Skill Tags with live inline review.
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadSample}
                className="h-8.5 px-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-md text-xs font-bold gap-1.5 transition shadow-xs cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-white/90" />
                Download Sample CSV
              </Button>

              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                className="h-8.5 w-8.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── 2. Modal Body ── */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* STEP 1: Upload Dropzone (When no parsed rows) */}
          {parsedRows.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-slate-50/60 hover:bg-indigo-50/30 rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group shadow-inner"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />

              <div className="h-16 w-16 rounded-2xl bg-white border border-indigo-100 group-hover:border-indigo-300 text-indigo-600 flex items-center justify-center shadow-md mb-4 transition group-hover:scale-105">
                {isParsing ? (
                  <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
                ) : (
                  <UploadCloud className="h-7 w-7 text-indigo-600 group-hover:scale-110 transition-transform" />
                )}
              </div>

              <h4 className="text-base font-extrabold text-slate-800">
                {isParsing ? "Analyzing & Classifying Questions..." : "Click or Drag & Drop CSV File"}
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm font-medium">
                Supported format: <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">.csv</span> with question prompt, options (A, B, C, D), and correct answer.
              </p>

              <div className="mt-5 flex items-center gap-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200/90 rounded-2xl px-4 py-2 shadow-xs">
                <span className="flex items-center gap-1 text-indigo-700">⚡ Auto-Category</span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-emerald-700">🟢 Auto-Difficulty</span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-pink-700">🏷️ Auto-Tags</span>
              </div>
            </div>
          ) : (
            /* STEP 2: Interactive Review & Preview Table */
            <div className="space-y-3.5">
              {/* Toolbar & KPI Stats */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-indigo-50/30 p-3.5 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="bg-white border-slate-200 text-slate-700 font-bold text-xs py-1 px-2.5 shadow-2xs">
                    Total: {parsedRows.length}
                  </Badge>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/80 font-bold text-xs py-1 px-2.5 shadow-2xs">
                    Ready: {validCount}
                  </Badge>
                  {issueCount > 0 && (
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200/80 font-bold text-xs py-1 px-2.5 shadow-2xs">
                      Needs Attention: {issueCount}
                    </Badge>
                  )}
                  <span className="text-[11px] text-slate-400 font-medium ml-1 flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-xl shadow-2xs">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-slate-500" />
                    <span className="text-slate-700 font-bold max-w-[200px] truncate">{fileName}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-52">
                    <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <Input
                      placeholder="Search questions or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 pl-8 text-xs bg-white rounded-xl border-slate-200 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setParsedRows([]);
                      setFileName("");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="h-8 px-3 rounded-xl border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold gap-1 shadow-2xs cursor-pointer transition"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                    New File
                  </Button>
                </div>
              </div>

              {/* Table Container - Hidden Ugly Scrollbar */}
              <div className="border border-slate-200/90 rounded-2xl overflow-hidden max-h-[50vh] overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 sticky top-0 z-10 text-[10.5px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-10">#</th>
                      <th className="py-2.5 px-3 min-w-[240px]">Question Prompt</th>
                      <th className="py-2.5 px-3 w-36">Category (Auto)</th>
                      <th className="py-2.5 px-3 w-28">Difficulty</th>
                      <th className="py-2.5 px-3 w-36">Correct Option</th>
                      <th className="py-2.5 px-3 min-w-[150px]">Skill Tags</th>
                      <th className="py-2.5 px-2 w-10 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-800">
                    {filteredRows.map((row) => (
                      <tr
                        key={row.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          !row.isValid ? "bg-amber-50/40" : ""
                        }`}
                      >
                        {/* Index & Status */}
                        <td className="py-2.5 px-3 align-top">
                          <div className="flex items-center gap-1.5 pt-1">
                            <span className="text-slate-400 font-bold text-[11px]">{row.index}</span>
                            {row.isValid ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            ) : (
                              <span title={row.warnings.join(" ")}>
                                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Question Prompt */}
                        <td className="py-2.5 px-3 align-top">
                          <textarea
                            rows={2}
                            value={row.question}
                            onChange={(e) => updateRowField(row.id, "question", e.target.value)}
                            className="w-full text-xs font-medium text-slate-800 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200/80 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 rounded-xl p-2 resize-none leading-relaxed transition no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                          />
                          {/* Options Preview Pills */}
                          <div className="flex flex-wrap gap-1.5 mt-1.5 text-[10.5px]">
                            {["A", "B", "C", "D"].map((letter) => {
                              const optVal = row[`option${letter}`];
                              if (!optVal) return null;
                              const isSelected = row.correctAnswer === `option${letter}`;
                              return (
                                <button
                                  key={letter}
                                  type="button"
                                  onClick={() => updateRowField(row.id, "correctAnswer", `option${letter}`)}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg cursor-pointer transition-all border text-left ${
                                    isSelected
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold ring-1 ring-emerald-500/20 shadow-2xs"
                                      : "bg-slate-50/80 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300 font-medium"
                                  }`}
                                  title={`Click to set ${letter} as correct answer: ${optVal}`}
                                >
                                  <span className={`h-3.5 w-3.5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                                    isSelected ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                                  }`}>
                                    {letter}
                                  </span>
                                  <span className="truncate max-w-[130px]">{optVal}</span>
                                </button>
                              );
                            })}
                          </div>
                        </td>

                        {/* Category Dropdown */}
                        <td className="py-2.5 px-3 align-top">
                          <Select
                            value={row.category}
                            onValueChange={(val) => {
                              const matched = categories.find((c) => c.name === val);
                              updateRowField(row.id, "category", val);
                              if (matched?.id) {
                                updateRowField(row.id, "categoryId", matched.id);
                              }
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs font-semibold rounded-xl bg-slate-50/80 hover:bg-white border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl shadow-xl">
                              {categories.map((c) => (
                                <SelectItem key={c.id} value={c.name} className="text-xs font-medium">
                                  {c.name}
                                </SelectItem>
                              ))}
                              {!categories.some((c) => c.name === row.category) && (
                                <SelectItem value={row.category} className="text-xs font-bold text-indigo-700 bg-indigo-50/50">
                                  ✨ {row.category} (New)
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </td>

                        {/* Difficulty Dropdown */}
                        <td className="py-2.5 px-3 align-top">
                          <Select
                            value={row.difficulty}
                            onValueChange={(val) => updateRowField(row.id, "difficulty", val)}
                          >
                            <SelectTrigger className="h-8 text-xs font-semibold rounded-xl bg-slate-50/80 hover:bg-white border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl shadow-xl">
                              <SelectItem value="Easy" className="text-xs font-medium">🟢 Easy</SelectItem>
                              <SelectItem value="Medium" className="text-xs font-medium">🟡 Medium</SelectItem>
                              <SelectItem value="Hard" className="text-xs font-medium">🔴 Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>

                        {/* Correct Answer Target (Clean Formatted Label) */}
                        <td className="py-2.5 px-3 align-top">
                          <Select
                            value={row.correctAnswer}
                            onValueChange={(val) => updateRowField(row.id, "correctAnswer", val)}
                          >
                            <SelectTrigger className="h-8 text-xs font-bold rounded-xl bg-emerald-50/80 hover:bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs focus:ring-2 focus:ring-emerald-500/20">
                              <div className="flex items-center gap-1.5 truncate">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                <span className="truncate">{formatOptionLabel(row.correctAnswer)}</span>
                              </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl shadow-xl border-slate-200">
                              <SelectItem value="optionA" className="text-xs font-bold text-emerald-800">
                                Option A {row.optionA ? `(${row.optionA.slice(0, 18)}${row.optionA.length > 18 ? "..." : ""})` : ""}
                              </SelectItem>
                              <SelectItem value="optionB" className="text-xs font-bold text-emerald-800">
                                Option B {row.optionB ? `(${row.optionB.slice(0, 18)}${row.optionB.length > 18 ? "..." : ""})` : ""}
                              </SelectItem>
                              {row.optionC && (
                                <SelectItem value="optionC" className="text-xs font-bold text-emerald-800">
                                  Option C {row.optionC ? `(${row.optionC.slice(0, 18)}${row.optionC.length > 18 ? "..." : ""})` : ""}
                                </SelectItem>
                              )}
                              {row.optionD && (
                                <SelectItem value="optionD" className="text-xs font-bold text-emerald-800">
                                  Option D {row.optionD ? `(${row.optionD.slice(0, 18)}${row.optionD.length > 18 ? "..." : ""})` : ""}
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </td>

                        {/* Skill Tags - With Seamless Inline Add Tag Chip */}
                        <td className="py-2.5 px-3 align-top">
                          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                            {row.tags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10.5px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/70 shadow-2xs"
                              >
                                <span>{tag}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateRowField(
                                      row.id,
                                      "tags",
                                      row.tags.filter((_, i) => i !== tIdx)
                                    )
                                  }
                                  className="h-3.5 w-3.5 rounded flex items-center justify-center hover:bg-indigo-200/60 text-indigo-500 hover:text-indigo-800 transition cursor-pointer"
                                  title="Remove tag"
                                >
                                  <X className="h-2.5 w-2.5" />
                                </button>
                              </span>
                            ))}

                            {inlineTagRowId === row.id ? (
                              <div className="inline-flex items-center gap-1 bg-white border border-indigo-300 rounded-lg px-1.5 py-0.5 shadow-2xs animate-in fade-in-50">
                                <input
                                  type="text"
                                  placeholder="Tag name..."
                                  value={inlineTagValue}
                                  onChange={(e) => setInlineTagValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      saveInlineTag(row.id);
                                    } else if (e.key === "Escape") {
                                      setInlineTagRowId(null);
                                    }
                                  }}
                                  className="w-20 text-[10.5px] font-semibold text-slate-800 outline-none bg-transparent"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => saveInlineTag(row.id)}
                                  className="text-emerald-600 hover:text-emerald-700 cursor-pointer p-0.5"
                                  title="Save Tag"
                                >
                                  <Check className="h-3 w-3 stroke-[3]" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setInlineTagRowId(null)}
                                  className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                                  title="Cancel"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setInlineTagRowId(row.id);
                                  setInlineTagValue("");
                                }}
                                className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 hover:border-indigo-300 px-1.5 py-0.5 border border-dashed border-slate-300 rounded-lg cursor-pointer transition bg-white"
                              >
                                + tag
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Delete Row */}
                        <td className="py-2.5 px-2 align-top text-center">
                          <button
                            type="button"
                            onClick={() => deleteRow(row.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                            title="Remove row"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ── 3. Modal Footer ── */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/70 shrink-0">
          {isImporting && importProgress ? (
            <div className="flex flex-col gap-2 py-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-2 text-indigo-600">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                  <span>
                    Importing batch {importProgress.currentBatch} of {importProgress.totalBatches}... ({importProgress.current}/{importProgress.total} questions processed)
                  </span>
                </span>
                <span className="text-indigo-700 font-mono font-bold">{importProgress.percent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#4E35E8] to-[#CF2E9F] transition-all duration-300 rounded-full"
                  style={{ width: `${importProgress.percent}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-slate-500 font-medium">
                {parsedRows.length > 0 ? (
                  <span>
                    Ready to save <strong className="text-slate-900 font-extrabold">{validCount}</strong> of{" "}
                    {parsedRows.length} questions as Draft.
                  </span>
                ) : (
                  <span>Tip: Download sample CSV to inspect expected column headers.</span>
                )}
              </p>

              <div className="flex items-center gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenChange(false)}
                  disabled={isImporting}
                  className="h-10 px-5 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </Button>

                {parsedRows.length > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleBulkImport}
                    disabled={isImporting || validCount === 0}
                    className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Import {validCount} Questions
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkQuestionImportDialog;
