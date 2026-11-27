import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api-handler";
import { getAuthUser } from "@/lib/auth/get-user";
import { UnauthorizedError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/rate-limit";
import { recommendationsService } from "@/modules/recommendations/recommendations.service";

export const GET = createApiHandler(async (request: Request) => {
  const auth = await getAuthUser();
  if (!auth?.dbUser) {
    throw new UnauthorizedError("Please sign in to view class recommendations");
  }

  checkRateLimit(`recommendations:${auth.dbUser.id}`, 60, 60 * 1000);

  const url = new URL(request.url);
  const context = url.searchParams.get("context") || "first-booking";

  if (context === "first-booking") {
    const data = await recommendationsService.getFirstBookingRecommendations(
      auth.dbUser.id
    );
    return NextResponse.json(data);
  }

  // Generic recommendations fallback
  const data = await recommendationsService.getFirstBookingRecommendations(
    auth.dbUser.id
  );
  return NextResponse.json(data);
});
