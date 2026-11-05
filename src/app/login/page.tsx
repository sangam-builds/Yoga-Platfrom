import type { Metadata } from "next";
import { Suspense } from "react";
import { YogaAuthSplitView } from "@/components/auth/YogaAuthSplitView";

export const metadata: Metadata = {
  title: "Sign In | ZenFlow Yoga Studio",
  description: "Sign in to pick up where your practice left off.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF6ED] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#47664A]/30 border-t-[#47664A] rounded-full animate-spin" />
        </div>
      }
    >
      <YogaAuthSplitView initialTab="signin" />
    </Suspense>
  );
}
