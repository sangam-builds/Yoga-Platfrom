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
      <div className="pb-2 border-b border-[#E9E2D0]">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B8F71] font-semibold">
          Security & Access Control
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#233D32]">
          Settings & Security
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          Manage two-factor authentication, active devices, and teacher account preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Two-Factor Authentication (MFA Mandatory for Instructors) */}
        <div className="bg-white p-6 rounded-2xl border border-[#E9E2D0] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E9E2D0]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-serif font-bold text-base text-[#233D32]">
                Two-Factor Authentication (MFA)
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
              Active (Enforced)
            </span>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            MFA protects your instructor revenue share, payout accounts, and practitioner privacy. An authenticator app (Google Authenticator, 1Password) is paired with your account.
          </p>

          <div className="p-3.5 rounded-xl bg-[#F8F7F2] border border-[#E9E2D0] flex items-center justify-between text-xs font-mono">
            <span>Primary Method: TOTP App</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.info("Recovery codes generated and saved.")}
              className="text-xs border-[#E9E2D0]"
            >
              View Recovery Codes
            </Button>
          </div>
        </div>

        {/* Password Update */}
        <div className="bg-white p-6 rounded-2xl border border-[#E9E2D0] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E9E2D0]">
            <Key className="w-5 h-5 text-[#6B8F71]" />
            <h3 className="font-serif font-bold text-base text-[#233D32]">
              Change Password
            </h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Current Password *
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-[#E9E2D0] rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                New Secure Password *
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full px-3 py-2 border border-[#E9E2D0] rounded-xl"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#233D32] hover:bg-[#1a2f26] text-white text-xs"
            >
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
