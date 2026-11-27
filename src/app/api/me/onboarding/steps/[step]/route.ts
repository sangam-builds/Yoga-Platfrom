import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api-handler";
import { getAuthUser } from "@/lib/auth/get-user";
import { UnauthorizedError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/rate-limit";
import { onboardingService } from "@/modules/onboarding/onboarding.service";

export const PATCH = createApiHandler(
  async (
    request: Request,
    context: { params: Promise<{ step: string }> }
  ) => {
    const auth = await getAuthUser();
    if (!auth?.dbUser) {
      throw new UnauthorizedError("Please sign in to save onboarding step");
    }

    const { step } = await context.params;

    checkRateLimit(`onboarding:step:${auth.dbUser.id}`, 30, 60 * 1000);

    const ifMatch = request.headers.get("if-match");
    const body = await request.json().catch(() => ({}));

    const result = await onboardingService.saveStep({
      userId: auth.dbUser.id,
      step,
      data: body,
      ifMatch,
    });

    return NextResponse.json(result);
  }
);
