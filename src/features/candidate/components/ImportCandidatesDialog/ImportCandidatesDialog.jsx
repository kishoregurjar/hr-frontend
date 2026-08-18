"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useImportCandidates } from "../../hooks";
import {
  parseCandidateCsv,
  validateCandidateCsv,
  validateCandidateCsvFile,
} from "../../utils";
import CandidateImportPreview from "../CandidateImportPreview";

const EMPTY_RESULT = {
  valid: [],
  invalid: [],
  duplicates: [],
};

const ImportCandidatesDialog = ({ existingCandidates = [] }) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(EMPTY_RESULT);
  const [fileError, setFileError] = useState("");
  const [isParsing, setIsParsing] = useState(false);

  const inputRef = useRef(null);
  const importMutation = useImportCandidates();

  const resetImport = () => {
    setFile(null);
    setResult(EMPTY_RESULT);
    setFileError("");
    setIsParsing(false);
    importMutation.reset();

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleOpenChange = (nextOpen) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetImport();
    }
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files?.[0];
    resetImport();

    if (!selectedFile) {
      return;
    }

    const error = validateCandidateCsvFile(selectedFile);
    if (error) {
      setFileError(error);
      return;
    }

    setFile(selectedFile);
    setIsParsing(true);

    try {
      const rows = await parseCandidateCsv(selectedFile);
      const validationResult = validateCandidateCsv(
        rows,
        existingCandidates
      );

      setResult(validationResult);
    } catch (err) {
      setFileError(err.message || "Unable to process CSV.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleImport = () => {
    const candidates = result.valid.map((item) => item.candidate);

    if (candidates.length === 0) {
      return;
    }

    importMutation.mutate(candidates, {
      onSuccess: () => {
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import CSV
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import Candidates</DialogTitle>
          <DialogDescription>
            Upload a CSV containing candidate name, email and optional phone number.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="rounded-xl border border-dashed p-6">
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-muted file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-muted/80 cursor-pointer"
            />

            <p className="mt-2 text-xs text-muted-foreground">
              Required columns: name, email. Optional: phone. Maximum 1000 candidates.
            </p>
          </div>

          {file && (
            <p className="text-sm">
              Selected: <span className="font-medium">{file.name}</span>
            </p>
          )}

          {isParsing && (
            <p className="text-sm text-muted-foreground">
              Processing CSV...
            </p>
          )}

          {fileError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3">
              <p className="text-sm text-destructive font-medium">
                {fileError}
              </p>
            </div>
          )}

          {!isParsing && file && !fileError && (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Valid</p>
                  <p className="mt-1 text-2xl font-semibold text-emerald-600">
                    {result.valid.length}
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Invalid</p>
                  <p className="mt-1 text-2xl font-semibold text-amber-600">
                    {result.invalid.length}
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Duplicate</p>
                  <p className="mt-1 text-2xl font-semibold text-rose-600">
                    {result.duplicates.length}
                  </p>
                </div>
              </div>

              {/* Valid Preview Table */}
              <CandidateImportPreview candidates={result.valid} />

              {/* Invalid Rows Report */}
              {result.invalid.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-destructive">Invalid Rows</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {result.invalid.map((item) => (
                      <div
                        key={item.rowNumber}
                        className="rounded-lg border border-destructive/30 bg-destructive/5 p-3"
                      >
                        <p className="text-sm font-medium">
                          Row {item.rowNumber}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.candidate.name || "Unnamed candidate"}
                          {" — "}
                          {item.candidate.email || "No email"}
                        </p>
                        <p className="mt-1 text-xs text-destructive">
                          {item.errors.join(", ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Duplicate Rows Report */}
              {result.duplicates.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">Duplicate Rows</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {result.duplicates.map((item) => (
                      <div
                        key={`${item.rowNumber}-${item.candidate.email}`}
                        className="rounded-lg border p-3"
                      >
                        <p className="text-sm">
                          Row <span className="font-medium">{item.rowNumber}</span>
                          {" — "}
                          {item.candidate.email}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {importMutation.error && (
                <p className="text-sm text-destructive font-medium">
                  {importMutation.error.message ||
                    "Unable to import candidates."}
                </p>
              )}

              <div className="flex justify-end gap-3 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={importMutation.isPending}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={handleImport}
                  disabled={
                    result.valid.length === 0 || importMutation.isPending
                  }
                >
                  {importMutation.isPending
                    ? "Importing..."
                    : `Import ${result.valid.length} Candidates`}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportCandidatesDialog;
