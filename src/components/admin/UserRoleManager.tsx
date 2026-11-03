"use client";

import React, { useState } from "react";
import { Search, Shield, UserCheck, User, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { UserRole, ROLES } from "@/lib/rbac/roles";

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface UserRoleManagerProps {
  initialUsers: ManagedUser[];
  currentAdminEmail: string;
}

export function UserRoleManager({ initialUsers, currentAdminEmail }: UserRoleManagerProps) {
  const [users, setUsers] = useState<ManagedUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async (targetUserId: string, targetEmail: string, newRole: UserRole) => {
    // Safety check: Prevent admin from demoting themselves
    if (targetEmail.toLowerCase() === currentAdminEmail.toLowerCase() && newRole !== ROLES.ADMIN) {
      setNotification({
        type: "error",
        text: "Safety lock: You cannot demote your own active administrator account.",
      });
      return;
    }

    try {
      setUpdatingId(targetUserId);
      setNotification(null);

      const res = await fetch("/api/admin/users/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, newRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        setNotification({
          type: "error",
          text: data.error || "Failed to update role.",
        });
        return;
      }

      // Update state locally
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUserId ? { ...u, role: newRole } : u))
      );

      setNotification({
        type: "success",
        text: `Role for ${targetEmail} updated to ${newRole} (Logged to Audit Trail).`,
      });
    } catch {
      setNotification({
        type: "error",
        text: "Network or server error while updating role.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          role="status"
          className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center justify-between shadow-sm border ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{notification.text}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs font-semibold uppercase hover:underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-[#E9E2D0] shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#292D2A]/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-[#F8F7F2] border border-[#E9E2D0] focus:outline-none focus:border-[#6B8F71] transition-colors"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {["ALL", ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.STUDENT].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                roleFilter === role
                  ? "bg-[#233D32] text-white"
                  : "bg-[#F8F7F2] text-[#292D2A]/70 hover:bg-[#E9E2D0]"
              }`}
            >
              {role === "ALL" ? "All Roles" : role}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-[#E9E2D0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8F7F2] border-b border-[#E9E2D0] text-[11px] font-semibold text-[#292D2A]/60 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Practitioner / User</th>
                <th className="py-3.5 px-6">Assigned RBAC Role</th>
                <th className="py-3.5 px-6">Change Role</th>
                <th className="py-3.5 px-6 text-right">Registered On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E2D0]/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-xs text-[#292D2A]/60 italic">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrentAdmin = u.email.toLowerCase() === currentAdminEmail.toLowerCase();
                  const isUpdating = updatingId === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-[#F4F7F4]/30 transition-colors">
                      {/* Name & Email */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#E9E2D0]/60 text-[#233D32] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {u.name ? u.name[0] : "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-[#233D32] flex items-center gap-1.5">
                              <span>{u.name || "Unnamed"}</span>
                              {isCurrentAdmin && (
                                <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-mono">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-[#292D2A]/60 font-mono">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Current Role Badge */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full font-semibold ${
                            u.role === ROLES.ADMIN
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : u.role === ROLES.INSTRUCTOR
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : "bg-gray-100 text-gray-800 border border-gray-200"
                          }`}
                        >
                          {u.role === ROLES.ADMIN && <Shield className="w-3 h-3 text-purple-600" />}
                          {u.role === ROLES.INSTRUCTOR && <UserCheck className="w-3 h-3 text-blue-600" />}
                          {u.role === ROLES.STUDENT && <User className="w-3 h-3 text-gray-500" />}
                          <span>{u.role}</span>
                        </span>
                      </td>

                      {/* Role Selector Trigger */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <select
                            value={u.role}
                            disabled={isUpdating}
                            onChange={(e) =>
                              handleRoleChange(u.id, u.email, e.target.value as UserRole)
                            }
                            className="bg-[#F8F7F2] border border-[#E9E2D0] text-xs font-medium rounded-xl py-1.5 px-3 focus:outline-none focus:border-[#6B8F71] transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <option value={ROLES.STUDENT}>STUDENT (Standard)</option>
                            <option value={ROLES.INSTRUCTOR}>INSTRUCTOR (Staff)</option>
                            <option value={ROLES.ADMIN}>ADMIN (Superuser)</option>
                          </select>

                          {isUpdating && (
                            <RefreshCw className="w-3.5 h-3.5 text-[#6B8F71] animate-spin" />
                          )}
                        </div>
                      </td>

                      {/* Registered Date */}
                      <td className="py-4 px-6 text-right font-mono text-xs text-[#292D2A]/60">
                        {new Date(u.createdAt).toLocaleDateString("en-US", {
                          dateStyle: "medium",
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

