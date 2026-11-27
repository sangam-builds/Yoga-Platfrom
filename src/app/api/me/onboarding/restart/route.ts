import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api-handler";
import { getAuthUser } from "@/lib/auth/get-user";
import { UnauthorizedError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/rate-limit";
import { onboardingService } from "@/modules/onboarding/onboarding.service";

export const POST = createApiHandler(async (request: Request) => {
  const auth = await getAuthUser();
  if (!auth?.dbUser) {
    throw new UnauthorizedError("Please sign in to restart onboarding");
  }

  checkRateLimit(`onboarding:restart:${auth.dbUser.id}`, 10, 60 * 1000);

  const result = await onboardingService.restartOnboarding(auth.dbUser.id);
  return NextResponse.json(result);
});
