"use client";

import { ShieldCheck } from "lucide-react";
import { RegisterForm } from "../components";

const RegisterPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/50 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Create HR Recruiter Account
          </h1>
          <p className="text-xs text-muted-foreground">
            Get started with multi-round cognitive assessment pipelines
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
