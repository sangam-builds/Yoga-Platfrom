import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/email-verified";

  if (token_hash && type) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      const emailParam = data.user?.email
        ? `?email=${encodeURIComponent(data.user.email)}`
        : "";
      const separator = next.includes("?") ? "&" : "?";
      const targetUrl = emailParam
        ? `${origin}${next}${separator}email=${encodeURIComponent(data.user?.email || "")}`
        : `${origin}${next}`;
      return NextResponse.redirect(targetUrl);
    }

    console.error("Auth confirm OTP error:", error);
    return NextResponse.redirect(
      `${origin}/email-verified?error=${encodeURIComponent(error.message)}`
    );
  }

  // Fallback: If no parameters, send to email-verified page
  return NextResponse.redirect(`${origin}/email-verified`);
}
