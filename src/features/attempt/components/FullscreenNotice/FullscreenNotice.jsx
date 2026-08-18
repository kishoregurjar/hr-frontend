"use client";

import { Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { enterFullscreen } from "../../utils";

const FullscreenNotice = ({ visible }) => {
  if (!visible) {
    return null;
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700 flex-shrink-0">
          <Maximize2 className="h-5 w-5" />
        </div>

        <div className="flex-1">
          <p className="font-semibold text-slate-900">Fullscreen mode exited</p>
          <p className="mt-1 text-sm text-slate-600">
            Your assessment is still in progress. For the best experience and formatting, please return to fullscreen mode.
          </p>

          <Button
            type="button"
            size="sm"
            className="mt-3"
            onClick={enterFullscreen}
          >
            Return to Fullscreen
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FullscreenNotice;
