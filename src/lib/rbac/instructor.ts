import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { ROLES, UserRole } from "./roles";

export interface AuthenticatedInstructorContext {
  authUser: {
    id: string;
    email?: string;
  };
  dbUser: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    supabaseId: string | null;
  };
  profile: {
    id: string;
    userId: string;
    approvalStatus: string;
    isActive: boolean;
    timezone: string;
    revenueSharePercent: number;
    ratingAvg: any;
    ratingCount: number;
  };
}

/**
 * Server-side guard for Instructor Portal routes.
 * Enforces authenticated session, INSTRUCTOR role, and active/approved profile.
 * Redirects to /instructor/review if pending, or /instructor/suspended if suspended.
 */
export async function requireInstructor(): Promise<AuthenticatedInstructorContext> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser || !authUser.email) {
    redirect(`/login?next=/instructor`);
  }

  // Lookup user in Prisma database
  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [{ supabaseId: authUser.id }, { email: authUser.email }],
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      supabaseId: true,
      instructorProfile: {
        select: {
          id: true,
          userId: true,
          approvalStatus: true,
          isActive: true,
          timezone: true,
          revenueSharePercent: true,
          ratingAvg: true,
          ratingCount: true,
        },
      },
    },
  });

  // If user does not exist yet in DB, check if admin or provision
  if (!dbUser) {
    redirect(`/login?next=/instructor`);
  }

  // If user is ADMIN, allow access and auto-ensure an InstructorProfile for preview/testing
  let profile = dbUser.instructorProfile;

  if (dbUser.role === ROLES.ADMIN && !profile) {
    profile = await prisma.instructorProfile.create({
      data: {
        userId: dbUser.id,
        approvalStatus: "APPROVED",
        isActive: true,
        timezone: "Asia/Kolkata",
        bio: "Senior Lead Yoga Master & Administrator",
        specialties: ["HATHA", "VINYASA", "MEDITATION"],
        certifications: ["RYT-500", "Yoga Alliance Certified"],
        yearsExperience: 10,
      },
      select: {
        id: true,
        userId: true,
        approvalStatus: true,
        isActive: true,
        timezone: true,
        revenueSharePercent: true,
        ratingAvg: true,
        ratingCount: true,
      },
    });
  } else if (!profile && dbUser.role === ROLES.INSTRUCTOR) {
    profile = await prisma.instructorProfile.create({
      data: {
        userId: dbUser.id,
        approvalStatus: "APPROVED",
        isActive: true,
        timezone: "Asia/Kolkata",
        bio: "Certified Yoga Instructor",
        specialties: ["VINYASA", "HATHA"],
        certifications: ["RYT-200"],
        yearsExperience: 4,
      },
      select: {
        id: true,
        userId: true,
        approvalStatus: true,
        isActive: true,
        timezone: true,
        revenueSharePercent: true,
        ratingAvg: true,
        ratingCount: true,
      },
    });
  }

  if (dbUser.role !== ROLES.INSTRUCTOR && dbUser.role !== ROLES.ADMIN) {
    redirect("/unauthorized");
  }

  if (!profile) {
    redirect("/instructor/review");
  }

  if (profile.approvalStatus === "PENDING") {
    redirect("/instructor/review");
  }

  if (profile.approvalStatus === "SUSPENDED" || !profile.isActive) {
    redirect("/instructor/suspended");
  }

  return {
    authUser: { id: authUser.id, email: authUser.email },
    dbUser: {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role as UserRole,
      supabaseId: dbUser.supabaseId,
    },
    profile,
  };
}

/**
 * API route helper to authenticate instructor requests.
 * Throws errors or returns 401/403 with standardized JSON.
 */
export async function getInstructorApiAuth() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser || !authUser.email) {
    return { error: "Authentication required", status: 401 };
  }

  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [{ supabaseId: authUser.id }, { email: authUser.email }],
    },
    include: {
      instructorProfile: true,
    },
  });

  if (!dbUser) {
    return { error: "User account not found", status: 401 };
  }

  if (dbUser.role !== ROLES.INSTRUCTOR && dbUser.role !== ROLES.ADMIN) {
    return { error: "Forbidden: Instructor role required", status: 403 };
  }

  let profile = dbUser.instructorProfile;
  if (!profile && dbUser.role === ROLES.ADMIN) {
    profile = await prisma.instructorProfile.create({
      data: {
        userId: dbUser.id,
        approvalStatus: "APPROVED",
        isActive: true,
        bio: "Senior Lead Yoga Master & Administrator",
        specialties: ["HATHA", "VINYASA", "MEDITATION"],
        certifications: ["RYT-500"],
      },
    });
  }

  if (!profile) {
    return { error: "Instructor profile not found or pending", status: 403 };
  }

  if (profile.approvalStatus !== "APPROVED" || !profile.isActive) {
    return { error: `Instructor account is ${profile.approvalStatus.toLowerCase()}`, status: 403 };
  }

  return {
    instructorId: profile.id,
    userId: dbUser.id,
    user: dbUser,
    profile,
  };
}
