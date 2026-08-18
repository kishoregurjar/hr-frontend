"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";

const InvitationActions = ({ link }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!link) return;

    try {
      const fullUrl =
        typeof window !== "undefined" && !link.startsWith("http")
          ? `${window.location.origin}${link}`
          : link;

      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API unavailable
    }
  };

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={!link}
      onClick={handleCopy}
    >
      {copied ? (
        <>
          <Check className="mr-2 h-3.5 w-3.5 text-green-600" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="mr-2 h-3.5 w-3.5" />
          Copy Link
        </>
      )}
    </Button>
  );
};

export default InvitationActions;
