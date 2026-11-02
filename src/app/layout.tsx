import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#F8F7F2] text-[#292D2A]">
        {children}
      </body>
    </html>
  );
}
