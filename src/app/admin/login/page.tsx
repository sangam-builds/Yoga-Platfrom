"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@zenflow.yoga");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [seedStatus, setSeedStatus] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const supabase = createClient();

      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        // If user not found and it's the default admin email, suggest running the admin seed
        if (error.message.toLowerCase().includes("invalid login credentials")) {
          setErrorMessage(
            "Invalid credentials. If this is your first time, click 'Initialize Admin Account' below."
          );
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      if (!data.user) {
        setErrorMessage("Authentication failed. No user returned.");
        return;
      }

      // Verify role via server check endpoint
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.user.email, id: data.user.id }),
      });

      const verification = await res.json();

      if (!res.ok || !verification.isAdmin) {
        await supabase.auth.signOut();
        setErrorMessage(
          "Access Denied: This account is authenticated as a Student/User and lacks Administrator privileges."
        );
        return;
      }

      // Success -> Redirect to Admin Dashboard
      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage("An unexpected error occurred during admin authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  // One-click quick seed for testing / first run
  const handleQuickSeed = async () => {
    try {
      setSeedStatus("Initializing admin credentials...");
      const res = await fetch("/api/admin/setup", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        setEmail(data.credentials.email);
        setPassword(data.credentials.password);
        setSeedStatus(
          `Admin credentials ready! Click 'Sign In to Admin Portal' below.`
        );
      } else {
        setSeedStatus(`Notice: ${data.message || "Failed to initialize"}`);
      }
    } catch {
      setSeedStatus("Failed to contact admin setup endpoint.");
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
            Authorized personnel only. All access attempts are recorded in the security audit log.
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

          {seedStatus && (
            <div className="p-3.5 rounded-xl text-xs bg-[#6B8F71]/20 border border-[#6B8F71]/40 text-[#A8C2AC] leading-relaxed">
              {seedStatus}
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
              className="w-full mt-2 bg-[#6B8F71] hover:bg-[#57785D] text-white py-3 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2"
              isLoading={isLoading}
            >
              <span>Sign In to Admin Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Quick Setup helper box */}
          <div className="pt-4 border-t border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-[#F8F7F2]/60">
              <span>First time setup?</span>
              <button
                type="button"
                onClick={handleQuickSeed}
                className="text-[#A8C2AC] hover:text-white font-medium underline transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-[#A8C2AC]" />
                <span>Initialize Admin Credentials</span>
              </button>
            </div>
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

