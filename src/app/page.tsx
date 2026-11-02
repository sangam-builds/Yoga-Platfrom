import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { YogaClasses } from "@/components/landing/YogaClasses";
import { Membership } from "@/components/landing/Membership";
import { Instructors } from "@/components/landing/Instructors";
import { AboutUs } from "@/components/landing/AboutUs";
import { Testimonials } from "@/components/landing/Testimonials";
import { Contact } from "@/components/landing/Contact";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "ZenFlow | Premium Yoga & Mindfulness Platform",
  description:
    "Discover your inner peace through live & on-demand yoga classes led by certified master teachers. Start your 7-day free trial today.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#292D2A] flex flex-col selection:bg-[#6B8F71]/30 selection:text-[#233D32]">
      {/* Navigation */}
      <Navbar />

      {/* Main Landing Sections */}
      <main className="flex-1">
        <Hero />
        <Features />
        <YogaClasses />
        <Membership />
        <Instructors />
        <AboutUs />
        <Testimonials />
        <Contact />
        <FinalCTA />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
