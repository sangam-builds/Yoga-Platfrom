import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api-handler";
import { getAuthUser } from "@/lib/auth/get-user";
import { UnauthorizedError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/rate-limit";
import { onboardingService } from "@/modules/onboarding/onboarding.service";

export const GET = createApiHandler(async (request: Request) => {
  const auth = await getAuthUser();
  if (!auth?.dbUser) {
    throw new UnauthorizedError("Please sign in to view onboarding progress");
  }

  checkRateLimit(`onboarding:get:${auth.dbUser.id}`, 60, 60 * 1000);

  const data = await onboardingService.getOnboardingState(auth.dbUser.id);
  return NextResponse.json(data);
});
