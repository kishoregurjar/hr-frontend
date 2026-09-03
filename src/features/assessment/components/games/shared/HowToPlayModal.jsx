"use client";

import React from "react";
import { X, HelpCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HowToPlayModal({ isOpen, onClose, rules }) {
  if (!isOpen || !rules) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in-0 duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HelpCircle className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {rules.title || "How To Play"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition-colors"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <ul className="mt-5 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {rules.steps &&
            rules.steps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold mt-0.5">
                  {idx + 1}
                </span>
                <div
                  className="flex-1 text-foreground/90"
                  dangerouslySetInnerHTML={{ __html: step }}
                />
              </li>
            ))}
        </ul>

        <div className="mt-6 pt-4 border-t flex justify-end">
          <Button onClick={onClose} className="w-full sm:w-auto font-semibold px-6">
            Got it, Let's Play!
          </Button>
        </div>
      </div>
    </div>
  );
}
