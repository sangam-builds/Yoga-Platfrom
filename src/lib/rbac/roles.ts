export type UserRole = "ADMIN" | "INSTRUCTOR" | "STUDENT";

export const ROLES = {
  ADMIN: "ADMIN" as UserRole,
  INSTRUCTOR: "INSTRUCTOR" as UserRole,
  STUDENT: "STUDENT" as UserRole,
} as const;

/**
 * Admin Sub-roles for Least-Privilege Role-Based Access Control
 * As specified in Section 2 of Yoga Platform Admin Specification
 */
export type AdminSubRole =
  | "SUPER_ADMIN"
  | "OPERATIONS"
  | "SUPPORT"
  | "FINANCE"
  | "CONTENT"
  | "ANALYST";

export const ADMIN_SUBROLES = {
  SUPER_ADMIN: "SUPER_ADMIN" as AdminSubRole,
  OPERATIONS: "OPERATIONS" as AdminSubRole,
  SUPPORT: "SUPPORT" as AdminSubRole,
  FINANCE: "FINANCE" as AdminSubRole,
  CONTENT: "CONTENT" as AdminSubRole,
  ANALYST: "ANALYST" as AdminSubRole,
} as const;

export type Permission =
  // Super Admin
  | "admins.manage"
  | "settings.write"
  // Operations
  | "classes.manage"
  | "sessions.manage"
  | "instructors.manage"
  | "attendance.override"
  | "recordings.manage"
  // Support
  | "users.read"
  | "users.update_basic"
  | "users.read_sensitive"
  | "bookings.manage"
  | "subscriptions.read"
  | "credits.adjust"
  | "notifications.send"
  // Finance
  | "payments.read"
  | "refunds.create"
  | "invoices.manage"
  | "coupons.manage"
  | "payouts.manage"
  | "reports.finance"
  // Content
  | "blog.manage"
  | "faq.manage"
  | "poses.manage"
  | "certificates.templates"
  // Analyst
  | "reports.read"
  | "analytics.read";

export const SUBROLE_PERMISSIONS: Record<AdminSubRole, Permission[]> = {
  SUPER_ADMIN: [
    "admins.manage",
    "settings.write",
    "classes.manage",
    "sessions.manage",
    "instructors.manage",
    "attendance.override",
    "recordings.manage",
    "users.read",
    "users.update_basic",
    "users.read_sensitive",
    "bookings.manage",
    "subscriptions.read",
    "credits.adjust",
    "notifications.send",
    "payments.read",
    "refunds.create",
    "invoices.manage",
    "coupons.manage",
    "payouts.manage",
    "reports.finance",
    "blog.manage",
    "faq.manage",
    "poses.manage",
    "certificates.templates",
    "reports.read",
    "analytics.read",
  ],
  OPERATIONS: [
    "classes.manage",
    "sessions.manage",
    "instructors.manage",
    "attendance.override",
    "recordings.manage",
    "reports.read",
    "analytics.read",
  ],
  SUPPORT: [
    "users.read",
    "users.update_basic",
    "bookings.manage",
    "subscriptions.read",
    "credits.adjust",
    "notifications.send",
  ],
  FINANCE: [
    "payments.read",
    "refunds.create",
    "invoices.manage",
    "coupons.manage",
    "payouts.manage",
    "reports.finance",
    "reports.read",
  ],
  CONTENT: [
    "blog.manage",
    "faq.manage",
    "poses.manage",
    "certificates.templates",
  ],
  ANALYST: [
    "reports.read",
    "analytics.read",
  ],
};

/**
 * Check if a sub-role possesses a specific permission
 */
export function hasAdminPermission(
  subRole: AdminSubRole | string | null | undefined,
  permission: Permission
): boolean {
  if (!subRole) return false;
  if (subRole === "SUPER_ADMIN") return true;
  const permissions = SUBROLE_PERMISSIONS[subRole as AdminSubRole];
  return permissions ? permissions.includes(permission) : false;
}

/**
 * Check if a given role is an Administrator
 */
export function isAdmin(role: UserRole | string | null | undefined): boolean {
  return role === ROLES.ADMIN;
}

/**
 * Check if an email is a pre-configured Platform Super Administrator
 */
export function isConfiguredAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail === "admin@zenflow.yoga") return true;

  const envAdmins =
    process.env.ADMIN_EMAILS ||
    process.env.ADMIN_EMAIL ||
    process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
    "";

  const adminList = envAdmins
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return adminList.includes(cleanEmail);
}

/**
 * Resolve effective sub-role for an authenticated admin
 */
export function resolveAdminSubRole(email?: string | null, customSubRole?: string | null): AdminSubRole {
  if (isConfiguredAdminEmail(email)) {
    return "SUPER_ADMIN";
  }
  if (customSubRole && customSubRole in SUBROLE_PERMISSIONS) {
    return customSubRole as AdminSubRole;
  }
  return "OPERATIONS";
}
