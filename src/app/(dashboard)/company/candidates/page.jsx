"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CompanyCandidatesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/candidates");
  }, [router]);

  return null;
}
