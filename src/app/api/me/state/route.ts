import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api-handler";
import { getAuthUser } from "@/lib/auth/get-user";
import { UnauthorizedError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/rate-limit";
import { lifecycleService } from "@/modules/lifecycle/lifecycle.service";

export const GET = createApiHandler(async (request: Request) => {
  const auth = await getAuthUser();
  if (!auth?.dbUser) {
    throw new UnauthorizedError("Please sign in to retrieve user state");
  }

  checkRateLimit(`me:state:${auth.dbUser.id}`, 60, 60 * 1000);

  const url = new URL(request.url);
  const returnUrl = url.searchParams.get("returnUrl");

  const state = await lifecycleService.getUserState(auth.dbUser.id, returnUrl);
  return NextResponse.json(state);
});

export const POST = createApiHandler(async (request: Request) => {
  const auth = await getAuthUser();
  if (!auth?.dbUser) {
    throw new UnauthorizedError("Please sign in to update state");
  }

  const body = await request.json().catch(() => ({}));
  if (body?.action === "dismiss_checklist") {
    await lifecycleService.dismissChecklist(auth.dbUser.id);
    return NextResponse.json({ success: true, checklistDismissed: true });
  }

  return NextResponse.json({ success: true });
});
