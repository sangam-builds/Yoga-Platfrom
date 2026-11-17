import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/email-verified";

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Check if Supabase returned an error in the redirect URL
  const errorDescription = searchParams.get("error_description") || searchParams.get("error");
  if (errorDescription) {
    return NextResponse.redirect(
      `${origin}/email-verified?error=${encodeURIComponent(errorDescription)}`
    );
  }

  // 1. PKCE Code Exchange flow
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
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
    console.error("Auth callback code exchange error:", error);
    return NextResponse.redirect(
      `${origin}/email-verified?error=${encodeURIComponent(error.message)}`
    );
  }

  // 2. Token Hash OTP Verification flow (used in Supabase email confirmation links)
  if (token_hash && type) {
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
    console.error("Auth callback OTP verification error:", error);
    return NextResponse.redirect(
      `${origin}/email-verified?error=${encodeURIComponent(error.message)}`
    );
  }

  // Fallback: If no code or token, redirect to email-verified or login
  return NextResponse.redirect(`${origin}/email-verified`);
}
