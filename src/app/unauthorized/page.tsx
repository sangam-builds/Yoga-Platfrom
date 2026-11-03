import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, LogIn, Home } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#292D2A] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full text-center space-y-6 bg-white border border-[#E9E2D0] p-8 sm:p-10 rounded-3xl shadow-xl">
        {/* Shield Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Heading & Notice */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 font-semibold">
            403 • Role Access Restricted
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#233D32] pt-2">
            Administrator Access Required
          </h1>
          <p className="text-sm text-[#292D2A]/70 font-light leading-relaxed">
            Your current account does not have the <span className="font-semibold text-[#233D32]">ADMIN</span> role
            required to view this section. This portal is strictly restricted to platform management.
          </p>
        </div>

        {/* Helpful Actions */}
        <div className="pt-4 space-y-3">
          <Link
            href="/admin/login"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-[#233D32] hover:bg-[#6B8F71] text-[#F8F7F2] text-sm font-semibold transition-colors shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In with Admin Account</span>
          </Link>

          <Link
            href="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-full border border-[#E9E2D0] bg-[#F8F7F2] hover:bg-white text-[#233D32] text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to User Dashboard</span>
          </Link>

          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 py-2 text-xs text-[#292D2A]/60 hover:text-[#233D32] transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Back to ZenFlow Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

