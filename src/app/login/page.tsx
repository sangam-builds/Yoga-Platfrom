import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login | NexusApp",
  description: "Sign in to your account with email or Google",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your account to continue"
      footerText="Don't have an account?"
      footerLinkText="Sign up for free"
      footerLinkHref="/signup"
    >
      <GoogleSignInButton label="Continue with Google" />
      <AuthDivider />
      <LoginForm />
    </AuthCard>
  );
}

