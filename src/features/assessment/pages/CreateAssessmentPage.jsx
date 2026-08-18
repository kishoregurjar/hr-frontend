"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ROUTES } from "@/constants";
import {
  CreateAssessmentHeader,
  BasicInformationSection,
  QuestionSelectionSection,
} from "../components";

const CreateAssessmentPage = () => {
  const router = useRouter();
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const handlePublish = () => {
    toast.success("Assessment published successfully!");
    router.push(ROUTES.ASSESSMENTS);
  };

  const handleSaveDraft = () => {
    toast.success("Draft saved successfully!");
    router.push(ROUTES.ASSESSMENTS);
  };

  return (
    <div className="space-y-8">
      <CreateAssessmentHeader
        onPublish={handlePublish}
        onSaveDraft={handleSaveDraft}
      />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Form Settings */}
        <div className="lg:col-span-2 space-y-8">
          <BasicInformationSection />
          <QuestionSelectionSection
            selectedQuestionIds={selectedQuestions}
            onSelectionChange={setSelectedQuestions}
          />
        </div>

        {/* Right Summary Panel */}
        <div className="space-y-6">
          <div className="rounded-lg border bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-lg text-slate-900 border-b pb-2">
              Assessment Summary
            </h3>

            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium text-yellow-600 bg-yellow-50 px-2.5 py-0.5 rounded border border-yellow-100 text-xs">
                  Draft
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Selected Questions</span>
                <span className="font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded border">
                  {selectedQuestions.length}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium text-slate-700">Mixed Assessment</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Estimated Time</span>
                <span className="font-medium text-slate-700">45 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAssessmentPage;
