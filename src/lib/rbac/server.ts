import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { UserRole, ROLES, isAdmin, isConfiguredAdminEmail } from "./roles";

export interface AuthenticatedUserContext {
  authUser: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
    app_metadata?: Record<string, unknown>;
  };
  dbUser: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    supabaseId: string | null;
  };
  role: UserRole;
}

/**
 * Retrieves the current authenticated user and resolves their database role.
 * Automatically synchronizes Supabase Auth users with the Prisma User record.
 * Resilient against temporary DB timeouts or schema migrations.
 */
export async function getCurrentUserWithRole(): Promise<AuthenticatedUserContext | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser || !authUser.email) {
    return null;
  }

  const isPreconfiguredAdmin = isConfiguredAdminEmail(authUser.email);

  let dbUser: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    supabaseId: string | null;
  } | null = null;

  try {
    // 1. Check database for existing record
    const foundUser = await prisma.user.findFirst({
      where: {
        OR: [{ supabaseId: authUser.id }, { email: authUser.email }],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        supabaseId: true,
      },
    });

    if (!foundUser) {
      // Auto-provision user in Prisma
      const isMetadataAdmin =
        authUser.app_metadata?.role === ROLES.ADMIN ||
        authUser.user_metadata?.role === ROLES.ADMIN ||
        isPreconfiguredAdmin;

      const assignedRole: UserRole = isMetadataAdmin ? ROLES.ADMIN : ROLES.STUDENT;
      const name =
        (authUser.user_metadata?.full_name as string) ||
        (authUser.user_metadata?.name as string) ||
        authUser.email.split("@")[0] ||
        "ZenFlow Practitioner";

      const created = await prisma.user.create({
        data: {
          supabaseId: authUser.id,
          email: authUser.email,
          name: name,
          role: assignedRole,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          supabaseId: true,
        },
      });

      dbUser = { ...created, role: created.role as UserRole };
    } else {
      // If user is designated as admin via config/email but DB role isn't ADMIN, promote them
      if (isPreconfiguredAdmin && foundUser.role !== ROLES.ADMIN) {
        const updated = await prisma.user.update({
          where: { id: foundUser.id },
          data: { role: ROLES.ADMIN, supabaseId: authUser.id },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            supabaseId: true,
          },
        });
        dbUser = { ...updated, role: updated.role as UserRole };
      } else if (!foundUser.supabaseId) {
        const updated = await prisma.user.update({
          where: { id: foundUser.id },
          data: { supabaseId: authUser.id },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            supabaseId: true,
          },
        });
        dbUser = { ...updated, role: updated.role as UserRole };
      } else {
        dbUser = { ...foundUser, role: foundUser.role as UserRole };
      }
    }
  } catch (err) {
    console.warn("Prisma query in getCurrentUserWithRole encountered an issue (falling back to auth context):", err);
    // Non-blocking fallback for resilient access
    const fallbackRole: UserRole =
      isPreconfiguredAdmin ||
      authUser.app_metadata?.role === ROLES.ADMIN ||
      authUser.user_metadata?.role === ROLES.ADMIN
        ? ROLES.ADMIN
        : ROLES.STUDENT;

    dbUser = {
      id: authUser.id,
      name:
        (authUser.user_metadata?.full_name as string) ||
        (authUser.user_metadata?.name as string) ||
        authUser.email.split("@")[0] ||
        "ZenFlow Practitioner",
      email: authUser.email,
      role: fallbackRole,
      supabaseId: authUser.id,
    };
  }

  const effectiveRole: UserRole =
    dbUser?.role || (isPreconfiguredAdmin ? ROLES.ADMIN : ROLES.STUDENT);

  return {
    authUser: {
      id: authUser.id,
      email: authUser.email,
      user_metadata: authUser.user_metadata,
      app_metadata: authUser.app_metadata,
    },
    dbUser: {
      ...dbUser,
      role: effectiveRole,
    },
    role: effectiveRole,
  };
}

/**
 * Server guard: Enforces that the current request is from an ADMIN user.
 * Redirects to /admin/login if not signed in, or /unauthorized if not an admin.
 */
export async function requireAdmin(
  redirectTo = "/unauthorized"
): Promise<{ dbUser: NonNullable<AuthenticatedUserContext["dbUser"]>; authUser: AuthenticatedUserContext["authUser"] }> {
  const userContext = await getCurrentUserWithRole();

  if (!userContext || !userContext.authUser) {
    redirect("/admin/login");
  }

  if (!isAdmin(userContext.role)) {
    redirect(redirectTo);
  }

  return {
    dbUser: userContext.dbUser,
    authUser: userContext.authUser,
  };
}

/**
 * Server guard: Enforces that the current request has one of the specified roles.
 */
export async function requireRole(
  allowedRoles: UserRole[],
  redirectTo = "/unauthorized"
) {
  const userContext = await getCurrentUserWithRole();

  if (!userContext || !userContext.authUser) {
    redirect("/login");
  }

  if (!allowedRoles.includes(userContext.role)) {
    redirect(redirectTo);
  }

  return userContext;
}

/**
 * Records an immutable administrative audit event
 */
export async function logAuditEvent(params: {
  actorId: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : undefined,
        ip: params.ip,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
