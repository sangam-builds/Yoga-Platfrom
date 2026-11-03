import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { LogoutButton } from "@/components/auth/LogoutButton";

export const metadata: Metadata = {
  title: "Dashboard | NexusApp",
  description: "User dashboard and account profile",
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "User";

  const email = user.email || "No email available";
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const provider = user.app_metadata?.provider || "email";
  const lastSignIn = user.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Just now";

  const isAdminUser =
    user.app_metadata?.role === "ADMIN" ||
    user.user_metadata?.role === "ADMIN" ||
    user.email?.toLowerCase() === "admin@zenflow.yoga";

  // Compute initials for avatar fallback
  const initials = name
    .split(" ")
    .map((part: string) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Top Navigation Bar */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full bg-[#233D32] flex items-center justify-center text-[#F8F7F2] shadow-sm group-hover:bg-[#6B8F71] transition-colors">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3c-1.5 3-4 6-4 9a4 4 0 0 0 8 0c0-3-2.5-6-4-9z" />
                <path d="M7 10c-2.5 1.5-4 4-4 6.5A4.5 4.5 0 0 0 7.5 21c3 0 4.5-2 4.5-5" />
                <path d="M17 10c2.5 1.5 4 4 4 6.5A4.5 4.5 0 0 1 16.5 21c-3 0-4.5-2-4.5-5" />
              </svg>
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              ZenFlow
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {isAdminUser && (
              <Link
                href="/admin"
                className="text-xs sm:text-sm font-semibold bg-[#233D32] hover:bg-[#6B8F71] text-white transition-colors px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <span>Admin Console</span>
              </Link>
            )}
            <Link
              href="/"
              className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Home
            </Link>
            <LogoutButton variant="danger" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Welcome Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-20 h-20 rounded-2xl border-2 border-white/30 shadow-md object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl font-bold text-white shadow-md">
                  {initials || "U"}
                </div>
              )}

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur-md border border-white/20 text-blue-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Authenticated Session
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome back, {name}!
                </h1>
                <p className="text-sm text-blue-100">{email}</p>
              </div>
            </div>

            <div className="self-start sm:self-auto">
              <LogoutButton
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 shadow-none backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Decorative background glows */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Profile & Account Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Details */}
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Account Information
            </h2>

            <dl className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              <div className="py-2.5 flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Display Name</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100 text-right">
                  {name}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Email Address</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100 text-right">
                  {email}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Sign-In Method</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100 capitalize text-right">
                  {provider}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Last Sign-In</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100 text-right">
                  {lastSignIn}
                </dd>
              </div>
            </dl>
          </div>

          {/* Quick Actions & Security */}
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Session & Actions
            </h2>

            <div className="space-y-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your session is active and securely managed with Supabase SSR tokens.
              </p>

              <div className="pt-2 flex flex-col gap-2.5">
                <Link
                  href="/"
                  className="w-full text-center px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-medium transition-colors"
                >
                  Return to Home
                </Link>

                <LogoutButton variant="danger" className="w-full" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

