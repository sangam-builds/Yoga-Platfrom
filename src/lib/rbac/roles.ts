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
 * Check if a given role is an Instructor or higher
 */
export function isStaff(role: UserRole | string | null | undefined): boolean {
  return role === ROLES.ADMIN || role === ROLES.INSTRUCTOR;
}

