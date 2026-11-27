import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { RecommendationsService } from "../recommendations.service.ts";
import type { CandidateSession } from "../recommendations.repository.ts";
import { ClassLevel, ClassStyle, SessionStatus } from "@prisma/client";

describe("Recommendations Service Unit Tests", () => {
  const baseSessions: CandidateSession[] = [
    {
      id: "sess_1",
      classId: "cls_hatha",
      startsAt: new Date("2026-06-01T07:00:00Z"), // 7 AM UTC = MORNING
      endsAt: new Date("2026-06-01T07:45:00Z"),
      capacity: 20,
      bookedCount: 5,
      status: SessionStatus.SCHEDULED,
      class: {
        id: "cls_hatha",
        title: "Morning Gentle Hatha",
        slug: "morning-gentle-hatha",
        description: "Gentle sequence for waking up",
        style: ClassStyle.HATHA,
        level: ClassLevel.BEGINNER,
        durationMin: 45,
        thumbnailUrl: null,
        instructor: {
          bio: "Experienced instructor",
          ratingAvg: 4.9,
          user: { id: "inst_1", name: "Aarav Sharma", image: null },
        },
      },
    },
    {
      id: "sess_2",
      classId: "cls_power",
      startsAt: new Date("2026-06-01T17:00:00Z"), // 5 PM UTC = EVENING
      endsAt: new Date("2026-06-01T18:00:00Z"),
      capacity: 20,
      bookedCount: 10,
      status: SessionStatus.SCHEDULED,
      class: {
        id: "cls_power",
        title: "Power Core Flow",
        slug: "power-core-flow",
        description: "Sweaty intense flow",
        style: ClassStyle.POWER,
        level: ClassLevel.ALL_LEVELS,
        durationMin: 60,
        thumbnailUrl: null,
        instructor: {
          bio: "Fitness yogi",
          ratingAvg: 4.8,
          user: { id: "inst_2", name: "Priya Patel", image: null },
        },
      },
    },
    {
      id: "sess_3_full",
      classId: "cls_full",
      startsAt: new Date("2026-06-01T08:00:00Z"),
      endsAt: new Date("2026-06-01T08:45:00Z"),
      capacity: 10,
      bookedCount: 10, // FULL
      status: SessionStatus.SCHEDULED,
      class: {
        id: "cls_full",
        title: "Full Class",
        slug: "full-class",
        description: "No spots remaining",
        style: ClassStyle.HATHA,
        level: ClassLevel.BEGINNER,
        durationMin: 45,
        thumbnailUrl: null,
        instructor: {
          bio: "",
          ratingAvg: 5.0,
          user: { id: "inst_3", name: "Simran Kaur", image: null },
        },
      },
    },
  ];

  test("1. Ranks matching style, time slot and duration higher", () => {
    const service = new RecommendationsService();
    const ranked = service.rankSessions({
      sessions: baseSessions,
      preferredStyles: [ClassStyle.HATHA],
      preferredTimes: ["MORNING" as any],
      preferredDays: [1], // Monday
      hasLimitations: false,
      isPregnant: false,
      timezone: "UTC",
    });

    // Full session should be filtered out
    assert.equal(ranked.length, 2);
    assert.equal(ranked[0].sessionId, "sess_1");
    assert.ok(ranked[0].matchScore > ranked[1].matchScore);
    assert.ok(ranked[0].matchReasons.length >= 2);
  });

  test("2. Prioritizes gentle styles and penalizes vigorous styles when user has injuries", () => {
    const service = new RecommendationsService();
    const ranked = service.rankSessions({
      sessions: baseSessions,
      preferredStyles: [ClassStyle.POWER], // User wanted power, but has limitations
      preferredTimes: ["EVENING" as any],
      preferredDays: [],
      hasLimitations: true,
      isPregnant: false,
      timezone: "UTC",
    });

    const hathaRec = ranked.find((r) => r.style === ClassStyle.HATHA);
    const powerRec = ranked.find((r) => r.style === ClassStyle.POWER);

    assert.ok(hathaRec);
    assert.ok(powerRec);
    // Hatha gains +40 for gentle, Power loses -40 for vigorous
    assert.ok(hathaRec.matchScore > powerRec.matchScore);
    assert.ok(hathaRec.matchReasons.some((r) => r.includes("Gentle")));
  });

  test("3. Filters out completely booked sessions", () => {
    const service = new RecommendationsService();
    const ranked = service.rankSessions({
      sessions: baseSessions,
      preferredStyles: [],
      preferredTimes: [],
      preferredDays: [],
      hasLimitations: false,
      isPregnant: false,
      timezone: "UTC",
    });

    assert.ok(!ranked.some((r) => r.sessionId === "sess_3_full"));
  });
});
