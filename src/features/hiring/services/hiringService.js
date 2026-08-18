import { getHiringProcessById } from "@/lib/api/hiringProcesses";
import { getPipelineCandidates } from "@/lib/api/hiringPipeline";
import { advanceHiringRound } from "@/lib/api/hiringWorkflow";

export const hiringService = {
  getProcess: async (hiringProcessId) => {
    return getHiringProcessById(hiringProcessId);
  },

  getCandidates: async (hiringProcessId) => {
    return getPipelineCandidates(hiringProcessId);
  },

  advanceRound: async (payload) => {
    return advanceHiringRound(payload);
  },
};
