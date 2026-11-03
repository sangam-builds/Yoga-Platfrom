import React from "react";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/rbac/server";
import { prisma } from "@/lib/prisma";
import { Activity } from "lucide-react";

export const metadata: Metadata = {
  title: "Security Audit Logs | ZenFlow Admin",
  description: "Administrative audit trail and RBAC compliance log",
};

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  await requireAdmin();

  let auditLogs: Array<{
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    metadata: unknown;
    createdAt: Date;
    actor: { email: string; name: string } | null;
  }> = [];

  try {
    auditLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        actor: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });
  } catch (err) {
    console.error("Failed to load audit logs:", err);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E9E2D0]/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#233D32]">
            Platform Audit Trail & Security Ledger
          </h1>
          <p className="text-xs sm:text-sm text-[#292D2A]/70 font-light pt-1">
            Tamper-evident record of role assignments, privilege escalations, and administrative mutations.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#E9E2D0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8F7F2] border-b border-[#E9E2D0] text-[11px] font-semibold text-[#292D2A]/60 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Timestamp (UTC)</th>
                <th className="py-3.5 px-6">Action</th>
                <th className="py-3.5 px-6">Target Entity</th>
                <th className="py-3.5 px-6">Initiating Actor</th>
                <th className="py-3.5 px-6">Metadata Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E2D0]/60">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-[#292D2A]/60 italic">
                    <Activity className="w-6 h-6 mx-auto mb-2 text-[#6B8F71] opacity-50" />
                    No audit records recorded yet. Any administrative change will appear here automatically.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F4F7F4]/30 transition-colors font-mono text-xs">
                    <td className="py-4 px-6 text-[#292D2A]/70 whitespace-nowrap">
                      {new Date(log.createdAt).toISOString().replace("T", " ").slice(0, 19)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-[#233D32]">
                      {log.entity} {log.entityId ? `(#${log.entityId.slice(0, 8)})` : ""}
                    </td>
                    <td className="py-4 px-6 text-[#292D2A]/80 font-sans">
                      {log.actor ? `${log.actor.name} (${log.actor.email})` : "System Bootstrapper"}
                    </td>
                    <td className="py-4 px-6 text-[11px] text-[#292D2A]/60 max-w-xs truncate">
                      {log.metadata ? JSON.stringify(log.metadata) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

