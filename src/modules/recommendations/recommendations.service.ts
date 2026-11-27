import {
  type CandidateSession,
  RecommendationsRepository,
  recommendationsRepository,
} from "./recommendations.repository.ts";
import { ClassLevel, ClassStyle, DayTimeSlot } from "@prisma/client";
import { decryptLimitations } from "../onboarding/onboarding.crypto.ts";

export interface RankedRecommendation {
  sessionId: string;
  classId: string;
  title: string;
  slug: string;
  description: string;
  style: ClassStyle;
  level: ClassLevel;
  durationMin: number;
  thumbnailUrl: string | null;
  startsAt: string; // ISO string
  endsAt: string;
  spotsRemaining: number;
  instructor: {
    id: string;
    name: string;
    image: string | null;
    ratingAvg: number;
  };
  matchScore: number;
  matchReasons: string[];
}

export class RecommendationsService {
  private repo: RecommendationsRepository;

  constructor(repo: RecommendationsRepository = recommendationsRepository) {
    this.repo = repo;
  }

  async getFirstBookingRecommendations(userId: string): Promise<{
    recommendations: RankedRecommendation[];
    creditsRemaining: number;
    userTimezone: string;
    fallbackUsed: boolean;
  }> {
    const user = await this.repo.getUserPreferences(userId);
    const timezone = user?.timezone || "Asia/Kolkata";
    const creditsRemaining = user?.subscriptions[0]?.creditsRemaining ?? 5;

    // Check health limitations
    let hasLimitations = false;
    let isPregnant = false;
    if (user?.limitationsRecord) {
      try {
        const decrypted = decryptLimitations<any>(user.limitationsRecord);
        if (
          decrypted?.limitations &&
          decrypted.limitations.length > 0 &&
          !decrypted.limitations.includes("none")
        ) {
          hasLimitations = true;
        }
        isPregnant = Boolean(decrypted?.pregnancy);
      } catch {
        // Fallback safely
      }
    }

    const now = new Date();
    const primaryWindow = new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72 hours
    const levels: ClassLevel[] = [ClassLevel.BEGINNER, ClassLevel.ALL_LEVELS];

    // 1. Fetch initial candidate sessions within 72 hours
    let sessions = await this.repo.findUpcomingSessions({
      minDate: now,
      maxDate: primaryWindow,
      levels,
    });

    let fallbackUsed = false;

    // 2. Fallback: if fewer than 3 sessions, widen window to 7 days
    if (sessions.length < 3) {
      fallbackUsed = true;
      const extendedWindow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      sessions = await this.repo.findUpcomingSessions({
        minDate: now,
        maxDate: extendedWindow,
        levels,
      });
    }

    // 3. Rank sessions
    const ranked = this.rankSessions({
      sessions,
      preferredStyles: (user?.preferredStyles as ClassStyle[]) || [],
      preferredTimes: (user?.preferredTimes as DayTimeSlot[]) || [],
      preferredDays: user?.preferredDays || [],
      hasLimitations,
      isPregnant,
      timezone,
    });

    // Record milestone in background
    this.repo.recordFirstBookingShown(userId);

    return {
      recommendations: ranked.slice(0, 4),
      creditsRemaining,
      userTimezone: timezone,
      fallbackUsed,
    };
  }

  rankSessions(params: {
    sessions: CandidateSession[];
    preferredStyles: ClassStyle[];
    preferredTimes: DayTimeSlot[];
    preferredDays: number[];
    hasLimitations: boolean;
    isPregnant: boolean;
    timezone: string;
  }): RankedRecommendation[] {
    const {
      sessions,
      preferredStyles,
      preferredTimes,
      preferredDays,
      hasLimitations,
      isPregnant,
      timezone,
    } = params;

    const scored = sessions
      .filter((s) => s.bookedCount < s.capacity) // only sessions with open spots
      .map((session) => {
        let score = 100;
        const reasons: string[] = [];

        const style = session.class.style;
        const duration = session.class.durationMin;

        // 1. Style match (+50)
        if (preferredStyles.includes(style)) {
          score += 50;
          reasons.push(`Matches your interest in ${style.toLowerCase()}`);
        }

        // 2. Health considerations
        const gentleStyles: ClassStyle[] = [
          ClassStyle.HATHA,
          ClassStyle.YIN,
          ClassStyle.MEDITATION,
          ClassStyle.BREATHWORK,
          ClassStyle.PRENATAL,
        ];
        const vigorousStyles: ClassStyle[] = [
          ClassStyle.POWER,
          ClassStyle.ASHTANGA,
        ];

        if (hasLimitations || isPregnant) {
          if (gentleStyles.includes(style)) {
            score += 40;
            reasons.push("Gentle pace suited for your body");
          } else if (vigorousStyles.includes(style)) {
            score -= 40;
          }
        }

        // 3. Time of day match (+25)
        const sessionDate = new Date(session.startsAt);
        const hour = sessionDate.getUTCHours(); // approximate hour slot
        let timeSlot: DayTimeSlot = DayTimeSlot.MORNING;
        if (hour >= 11 && hour < 16) {
          timeSlot = DayTimeSlot.AFTERNOON;
        } else if (hour >= 16 || hour < 6) {
          timeSlot = DayTimeSlot.EVENING;
        }

        if (preferredTimes.includes(timeSlot)) {
          score += 25;
          reasons.push(`Fits your ${timeSlot.toLowerCase()} routine`);
        }

        // 4. Day of week match (+20)
        const dayOfWeek = sessionDate.getUTCDay();
        if (preferredDays.includes(dayOfWeek)) {
          score += 20;
          reasons.push("Scheduled on your preferred day");
        }

        // 5. Optimal duration for beginners (+15)
        if (duration >= 20 && duration <= 45) {
          score += 15;
          reasons.push("Comfortable 30–45 min duration");
        }

        const spotsRemaining = Math.max(0, session.capacity - session.bookedCount);

        return {
          sessionId: session.id,
          classId: session.class.id,
          title: session.class.title,
          slug: session.class.slug,
          description: session.class.description,
          style: session.class.style,
          level: session.class.level,
          durationMin: session.class.durationMin,
          thumbnailUrl: session.class.thumbnailUrl,
          startsAt: session.startsAt.toISOString(),
          endsAt: session.endsAt.toISOString(),
          spotsRemaining,
          instructor: {
            id: session.class.instructor.user.id,
            name: session.class.instructor.user.name,
            image: session.class.instructor.user.image,
            ratingAvg: session.class.instructor.ratingAvg,
          },
          matchScore: score,
          matchReasons: reasons.length > 0 ? reasons : ["Beginner-friendly class"],
        };
      });

    // Sort descending by matchScore, then by startsAt ascending
    return scored.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
    });
  }
}

export const recommendationsService = new RecommendationsService();
