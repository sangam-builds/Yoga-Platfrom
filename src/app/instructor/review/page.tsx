import React from "react";
import Link from "next/link";
import { Clock, ShieldCheck, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function InstructorReviewPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#292D2A] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E9E2D0] shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-bold text-[#233D32]">
            Application Under Review
          </h1>
          <p className="text-sm text-stone-600 leading-relaxed">
            Thank you for applying to teach at ZenFlow. Our wellness board is currently reviewing your certifications and background.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#F8F7F2] border border-[#E9E2D0] text-left text-xs text-stone-600 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-[#233D32]">
            <ShieldCheck className="w-4 h-4 text-[#6B8F71]" />
            What happens next:
          </div>
          <ul className="list-disc pl-4 space-y-1">
            <li>Verification of RYT/Yoga Alliance credentials</li>
            <li>Review takes 24–48 hours on business days</li>
            <li>You will receive an email once approved to start creating classes</li>
          </ul>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <Link href="mailto:instructors@zenflow.yoga">
            <Button variant="outline" className="w-full justify-center gap-2 text-xs">
              <Mail className="w-4 h-4" />
              Contact Instructor Operations
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

