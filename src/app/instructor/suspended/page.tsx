import React from "react";
import Link from "next/link";
import { AlertTriangle, Mail, ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function InstructorSuspendedPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#292D2A] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-red-200 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-bold text-[#233D32]">
            Instructor Account Suspended
          </h1>
          <p className="text-sm text-stone-600 leading-relaxed">
            Your teaching access is currently paused. Future class sessions cannot be initiated or scheduled during suspension.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 text-left text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Notice:
          </div>
          <p>
            Past earnings and payout history remain accessible. For inquiries or resolution regarding your account status, please reach out to operations.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <Link href="mailto:support@zenflow.yoga">
            <Button variant="outline" className="w-full justify-center gap-2 text-xs">
              <Mail className="w-4 h-4" />
              Contact Instructor Support
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="w-full justify-center gap-2 text-xs text-stone-500">
              <ArrowLeft className="w-4 h-4" />
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
