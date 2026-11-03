import React from "react";
import { UserRole } from "@/lib/rbac/roles";
import { LogoutButton } from "@/components/auth/LogoutButton";

export interface AdminHeaderProps {
  adminEmail: string;
  adminName: string;
  role: UserRole;
}

export function AdminHeader({ adminEmail, adminName, role }: AdminHeaderProps) {
  return (
    <header className="h-16 border-b border-[#E9E2D0] bg-white/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-serif font-bold text-[#233D32]">
          Administrative Console
        </h2>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#233D32] text-white font-mono font-semibold">
          {role}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-[#233D32]">{adminName}</p>
          <p className="text-[11px] text-[#292D2A]/60 font-mono">{adminEmail}</p>
        </div>

        <LogoutButton variant="outline" className="text-xs py-1.5 px-3" />
      </div>
    </header>
  );
}

