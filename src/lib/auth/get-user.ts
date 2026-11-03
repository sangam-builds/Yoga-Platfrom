import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser || !authUser.email) {
      return null;
    }

    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ supabaseId: authUser.id }, { email: authUser.email }],
      },
      include: {
        subscriptions: {
          where: {
            status: { in: ["ACTIVE", "TRIALING"] },
          },
          include: { plan: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    // Auto-create in database if user signed in via Supabase but not yet in Prisma
    if (!dbUser) {
      const name =
        authUser.user_metadata?.full_name ||
        authUser.user_metadata?.name ||
        authUser.email.split("@")[0] ||
        "ZenFlow Yogi";

      dbUser = await prisma.user.create({
        data: {
          supabaseId: authUser.id,
          email: authUser.email,
          name,
          role: "STUDENT",
        },
        include: {
          subscriptions: {
            include: { plan: true },
          },
        },
      });
    }

    return {
      authUser,
      dbUser,
    };
  } catch (err) {
    console.error("Error in getAuthUser:", err);
    return null;
  }
}

