"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Sparkles, Key } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@zenflow.yoga");
  const [password, setPassword] = useState("AdminZenFlow2026!");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      setStatusMessage(null);

      const supabase = createClient();

      // Attempt login
      let { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      // If user not registered yet in Supabase Auth or email unconfirmed, attempt auto-setup for admin
      if (
        error &&
        (error.message.toLowerCase().includes("invalid login credentials") ||
          error.message.toLowerCase().includes("email not confirmed"))
      ) {
        setStatusMessage("Verifying and activating admin account...");
        const setupRes = await fetch("/api/admin/setup", { method: "POST" });
        const setupData = await setupRes.json();

        if (setupRes.ok) {
          // Retry login after auto-provision
          const retry = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password,
          });
          data = retry.data;
          error = retry.error;
        } else {
          setErrorMessage(`Setup failed: ${setupData.error || "Could not auto-register admin."}`);
          return;
        }
      }

      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          setErrorMessage(
            "Supabase requires email confirmation. Please check your inbox or disable 'Confirm email' in Supabase Dashboard -> Authentication -> Providers -> Email."
          );
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      if (!data.user) {
        setErrorMessage("Authentication failed: No user profile returned.");
        return;
      }

      // Verify RBAC Admin privileges
      const verifyRes = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.user.email, id: data.user.id }),
      });

      const verification = await verifyRes.json();

      if (!verifyRes.ok || !verification.isAdmin) {
        await supabase.auth.signOut();
        setErrorMessage(
          `Access Denied: Account (${data.user.email}) has role '${verification.role || "STUDENT"}' and lacks ADMIN privileges.`
        );
        return;
      }

      // Role confirmed -> Navigate to Admin Dashboard
      setStatusMessage("Admin authorization confirmed. Redirecting to dashboard...");
      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage("An unexpected error occurred during admin authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth Login for Admin
  const handleGoogleAdminLogin = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/admin`,
        },
      });
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to initiate Google OAuth.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A2F26] text-[#F8F7F2] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#6B8F71]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#233D32]/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-[#6B8F71] text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="text-left">
              <span className="font-serif text-2xl font-bold tracking-tight text-white block">
                ZenFlow
              </span>
              <span className="text-[10px] tracking-widest uppercase text-[#A8C2AC] font-semibold -mt-1 block">
                Management Console
              </span>
            </div>
          </Link>

          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider bg-white/10 text-[#A8C2AC] border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Restricted RBAC Environment
            </span>
          </div>

          <h1 className="text-2xl font-serif font-bold text-white pt-2">
            Staff & Admin Sign In
          </h1>
          <p className="text-xs text-[#F8F7F2]/70 font-light">
            Authorized personnel only. Non-admin accounts will be automatically rejected.
          </p>
        </div>

        {/* Credentials Quick Hint Card */}
        <div className="bg-[#233D32]/80 border border-[#6B8F71]/30 p-4 rounded-2xl text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-[#A8C2AC]">
            <Key className="w-3.5 h-3.5 text-[#6B8F71]" />
            <span>Default Admin Credentials:</span>
          </div>
          <p className="font-mono text-[11px] text-[#F8F7F2]/80">
            Email: <span className="text-white font-bold">admin@zenflow.yoga</span>
          </p>
          <p className="font-mono text-[11px] text-[#F8F7F2]/80">
            Password: <span className="text-white font-bold">AdminZenFlow2026!</span>
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-[#233D32] border border-[#6B8F71]/30 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-5">
          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 rounded-xl text-xs bg-red-950/80 border border-red-800 text-red-200 flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {statusMessage && (
            <div className="p-3.5 rounded-xl text-xs bg-[#6B8F71]/20 border border-[#6B8F71]/40 text-[#A8C2AC] leading-relaxed flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#A8C2AC] shrink-0 animate-spin" />
              <span>{statusMessage}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <Input
              label="Admin Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@zenflow.yoga"
              required
              className="bg-[#1A2F26] border-white/15 text-white placeholder-white/30 focus:border-[#6B8F71]"
              leftIcon={<Mail className="w-4 h-4 text-[#A8C2AC]" />}
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="bg-[#1A2F26] border-white/15 text-white placeholder-white/30 focus:border-[#6B8F71]"
              leftIcon={<Lock className="w-4 h-4 text-[#A8C2AC]" />}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2 bg-[#6B8F71] hover:bg-[#57785D] text-white py-3 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2 cursor-pointer"
              isLoading={isLoading}
            >
              <span>Sign In to Admin Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Social OAuth for Admin */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleGoogleAdminLogin}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs text-[#F8F7F2] font-medium transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google as Admin</span>
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-[#F8F7F2]/50">
          Not an administrator?{" "}
          <Link href="/login" className="text-[#A8C2AC] hover:underline font-medium">
            Standard Member Login
          </Link>
        </p>
      </div>
    </div>
  );
}
