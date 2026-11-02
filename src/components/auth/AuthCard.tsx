import React from "react";
import Link from "next/link";

export interface AuthCardProps {
  title: string;
  subtitle: string;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
  children: React.ReactNode;
}

export function AuthCard({
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkHref,
  children,
}: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="w-full max-w-md">
        {/* Brand / Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-[#233D32] flex items-center justify-center text-[#F8F7F2] shadow-sm group-hover:bg-[#6B8F71] transition-colors">
              <svg
                className="w-6 h-6"
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
            <div className="text-left flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-tight text-[#233D32] dark:text-white">
                ZenFlow
              </span>
              <span className="text-[10px] tracking-widest uppercase text-[#6B8F71] font-medium -mt-1">
                Yoga Sanctuary
              </span>
            </div>
          </Link>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        </div>

        {/* Card Body */}
        <div className="bg-white dark:bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
          {children}
        </div>

        {/* Footer Link */}
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {footerText}{" "}
          <Link
            href={footerLinkHref}
            className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline transition-colors"
          >
            {footerLinkText}
          </Link>
        </p>
      </div>
    </div>
  );
}

