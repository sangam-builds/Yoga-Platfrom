import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const updateSession = async (request: NextRequest) => {
  // Create an unmodified base response
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Do not run code between createServerClient and supabase.auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Helper: Copy all refreshed cookies to any redirect response
  const createRedirectWithCookies = (url: URL) => {
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  };

  const configuredAdminEmails = (
    process.env.ADMIN_EMAILS ||
    process.env.ADMIN_EMAIL ||
    "admin@zenflow.yoga"
  )
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const isUserEmailAdmin =
    user?.email &&
    (configuredAdminEmails.includes(user.email.toLowerCase()) ||
      user.email.toLowerCase() === "admin@zenflow.yoga");

  // 1. Guard /admin routes (except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    // If not authenticated, redirect to /admin/login
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return createRedirectWithCookies(url);
    }

    // Edge check: If user role is explicitly known to not be ADMIN and email is not in admin list
    const role =
      (user.app_metadata?.role as string) ||
      (user.user_metadata?.role as string);

    if (role && role !== "ADMIN" && !isUserEmailAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/unauthorized";
      return createRedirectWithCookies(url);
    }
  }

  // 2. Guard /instructor routes (except /instructor/login)
  if (pathname.startsWith("/instructor") && pathname !== "/instructor/login") {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return createRedirectWithCookies(url);
    }
  }

  // 3. Guard /dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return createRedirectWithCookies(url);
    }
  }

  // 3. If authenticated admin visits /admin/login, redirect to /admin
  if (pathname === "/admin/login" && user) {
    const role =
      (user.app_metadata?.role as string) ||
      (user.user_metadata?.role as string);

    if (role === "ADMIN" || isUserEmailAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return createRedirectWithCookies(url);
    }
  }

  return supabaseResponse;
};

export const createClient = updateSession;
