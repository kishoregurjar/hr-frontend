"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CompanyTeamRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/company?tab=members");
  }, [router]);

  return null;
}
