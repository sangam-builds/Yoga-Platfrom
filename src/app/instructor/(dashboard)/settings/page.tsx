"use client";

import React, { useState } from "react";
import { ShieldCheck, Lock, Smartphone, Globe, Bell, Key, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/dashboard/shared/Toast";

export default function InstructorSettingsPage() {
  const { toast } = useToast();
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    toast.success("Password updated successfully.");
    setCurrentPassword("");
    setNewPassword("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="pb-2 border-b border-[var(--border-hairline)]">
        <span className="text-[11px] font-outfit uppercase tracking-widest text-[var(--primary-sage)] font-bold">
          Security & Access Control
        </span>
        <h1 className="font-outfit text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
          Settings & Security
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] font-figtree">
          Manage two-factor authentication, active devices, and teacher account preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-figtree">
        {/* Two-Factor Authentication (MFA Mandatory for Instructors) */}
        <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[var(--primary-sage)]" />
              <h3 className="font-outfit font-bold text-base text-[var(--text-primary)]">
                Two-Factor Authentication (MFA)
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--sage-tint)] text-[var(--primary-sage)]">
              Active (Enforced)
            </span>
          </div>

          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            MFA protects your instructor revenue share, payout accounts, and practitioner privacy. An authenticator app (Google Authenticator, 1Password) is paired with your account.
          </p>

          <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-hairline)] flex items-center justify-between text-xs">
            <span className="text-[var(--text-primary)] font-medium">Primary Method: TOTP App</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.info("Recovery codes generated and saved.")}
              className="text-xs border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer"
            >
              View Recovery Codes
            </Button>
          </div>
        </div>

        {/* Password Update */}
        <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-hairline)]">
            <Key className="w-5 h-5 text-[var(--primary-sage)]" />
            <h3 className="font-outfit font-bold text-base text-[var(--text-primary)]">
              Change Password
            </h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">
                Current Password *
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary-sage)]/30 focus:border-[var(--primary-sage)]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">
                New Secure Password *
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full px-3 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary-sage)]/30 focus:border-[var(--primary-sage)]"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[var(--primary-sage)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] text-xs cursor-pointer shadow-xs"
            >
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
