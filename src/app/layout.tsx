import type { Metadata } from "next";
import { Outfit, Figtree } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "ZenFlow | Premium Yoga & Mindfulness Platform",
  description:
    "Discover your inner peace through live and on-demand yoga classes led by certified master teachers. Start your mindful wellness journey today.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${figtree.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
