import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create an Account | NexusApp",
  description: "Create your new account with Google or email",
};

export default function SignupPage() {
  return (
    <AuthCard
      title="Create your account"
      subtitle="Join in seconds to get started"
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/login"
    >
      <GoogleSignInButton label="Sign up with Google" />
      <AuthDivider />
      <SignupForm />
    </AuthCard>
  );
}

