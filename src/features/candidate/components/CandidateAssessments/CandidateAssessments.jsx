"use client";

import { ClipboardList, Copy, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAssessmentsQuery } from "@/features/assessment/hooks";

import { useCandidateAssignments, useSendInvitation } from "../../hooks";
import { formatCandidateDate } from "../../utils";

const CandidateAssessments = ({ candidateId }) => {
  const {
    data: assignments = [],
    isLoading: assignmentsLoading,
  } = useCandidateAssignments(candidateId);

  const {
    data: assessments = [],
    isLoading: assessmentsLoading,
  } = useAssessmentsQuery();

  const sendInvitation = useSendInvitation();

  const isLoading = assignmentsLoading || assessmentsLoading;

  const getAssessment = (assessmentId) => {
    return assessments.find(
      (assessment) => String(assessment.id) === String(assessmentId)
    );
  };

  const handleCopyLink = async (token) => {
    if (!token) {
      return;
    }

    const link = `${window.location.origin}/assessment/invite/${token}`;
    await navigator.clipboard.writeText(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Assessments
        </CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">
            Loading assessments...
          </p>
        ) : assignments.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No assessments assigned to this candidate.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => {
              const assessment = getAssessment(assignment.assessmentId);

              return (
                <div
                  key={assignment.id}
                  className="rounded-lg border p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-medium">
                        {assessment?.title || "Assessment"}
                      </h3>

                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <p>
                          Status:{" "}
                          <span className="font-medium text-foreground">
                            {assignment.status}
                          </span>
                        </p>

                        <p>
                          Assigned:{" "}
                          {formatCandidateDate(assignment.assignedAt)}
                        </p>

                        {assignment.invitedAt && (
                          <p>
                            Invited:{" "}
                            {formatCandidateDate(assignment.invitedAt)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {assignment.status === "Assigned" && (
                        <Button
                          type="button"
                          onClick={() => sendInvitation.mutate(assignment.id)}
                          disabled={sendInvitation.isPending}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Send Invitation
                        </Button>
                      )}

                      {assignment.invitationToken && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            handleCopyLink(assignment.invitationToken)
                          }
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Link
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CandidateAssessments;
