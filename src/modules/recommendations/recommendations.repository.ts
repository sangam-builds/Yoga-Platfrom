import { prisma } from "../../lib/prisma.ts";
import { ClassLevel, ClassStyle, SessionStatus } from "@prisma/client";

export interface CandidateSession {
  id: string;
  classId: string;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
  bookedCount: number;
  status: SessionStatus;
  class: {
    id: string;
    title: string;
    slug: string;
    description: string;
    style: ClassStyle;
    level: ClassLevel;
    durationMin: number;
    thumbnailUrl: string | null;
    instructor: {
      bio: string | null;
      ratingAvg: number;
      user: {
        id: string;
        name: string;
        image: string | null;
      };
    };
  };
}

export class RecommendationsRepository {
  async findUpcomingSessions(params: {
    minDate: Date;
    maxDate: Date;
    levels: ClassLevel[];
  }): Promise<CandidateSession[]> {
    const { minDate, maxDate, levels } = params;

    return prisma.classSession.findMany({
      where: {
        status: SessionStatus.SCHEDULED,
        startsAt: {
          gte: minDate,
          lte: maxDate,
        },
        class: {
          level: { in: levels },
          isActive: true,
        },
      },
      include: {
        class: {
          include: {
            instructor: {
              include: {
                user: {
                  select: { id: true, name: true, image: true },
                },
              },
            },
          },
        },
      },
      orderBy: { startsAt: "asc" },
      take: 50,
    }) as unknown as CandidateSession[];
  }

  async getUserPreferences(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        experienceLevel: true,
        goals: true,
        preferredStyles: true,
        preferredTimes: true,
        preferredDays: true,
        weeklyGoal: true,
        timezone: true,
        locale: true,
        trialStartedAt: true,
        trialEndsAt: true,
        limitationsRecord: true,
        subscriptions: {
          where: { status: { in: ["ACTIVE", "TRIALING"] } },
          select: { creditsRemaining: true },
          take: 1,
        },
      },
    });
  }

  async recordFirstBookingShown(userId: string) {
    try {
      await prisma.activationEvent.upsert({
        where: {
          userId_type: {
            userId,
            type: "FIRST_BOOKING_SHOWN",
          },
        },
        create: {
          userId,
          type: "FIRST_BOOKING_SHOWN",
          metadata: { shownAt: new Date().toISOString() },
        },
        update: {},
      });
    } catch {
      // Non-blocking milestone
    }
  }
}

export const recommendationsRepository = new RecommendationsRepository();
