export type UserRole = "ADMIN" | "INSTRUCTOR" | "STUDENT";

export const ROLES = {
  ADMIN: "ADMIN" as UserRole,
  INSTRUCTOR: "INSTRUCTOR" as UserRole,
  STUDENT: "STUDENT" as UserRole,
} as const;

export type Permission =
  | "ACCESS_ADMIN"
  | "MANAGE_USERS"
  | "MANAGE_ROLES"
  | "MANAGE_CLASSES"
  | "VIEW_ANALYTICS"
  | "VIEW_AUDIT_LOGS"
  | "MANAGE_BILLING"
  | "TEACH_CLASSES"
  | "VIEW_ATTENDANCE"
  | "BOOK_CLASSES";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    "ACCESS_ADMIN",
    "MANAGE_USERS",
    "MANAGE_ROLES",
    "MANAGE_CLASSES",
    "VIEW_ANALYTICS",
    "VIEW_AUDIT_LOGS",
    "MANAGE_BILLING",
    "TEACH_CLASSES",
    "VIEW_ATTENDANCE",
    "BOOK_CLASSES",
  ],
  INSTRUCTOR: ["TEACH_CLASSES", "VIEW_ATTENDANCE", "BOOK_CLASSES"],
  STUDENT: ["BOOK_CLASSES"],
};

/**
 * Check if a given role has a specific permission
 */
export function hasPermission(
  role: UserRole | string | null | undefined,
  permission: Permission
): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role as UserRole];
  return permissions ? permissions.includes(permission) : false;
}

/**
 * Check if a given role is an Administrator
 */
export function isAdmin(role: UserRole | string | null | undefined): boolean {
  return role === ROLES.ADMIN;
}

/**
 * Check if an email is a pre-configured Platform Administrator
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
 * Check if a given role is an Instructor or higher
 */
export function isStaff(role: UserRole | string | null | undefined): boolean {
  return role === ROLES.ADMIN || role === ROLES.INSTRUCTOR;
}
