import React from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";

export function Membership() {
  const plans = [
    {
      name: "Free Trial",
      badge: "7-Day Experience",
      description:
        "Experience the full spectrum of ZenFlow live and on-demand classes without any commitment.",
      price: "Free",
      period: "for 7 days",
      priceNote: "(Demo Placeholder)",
      popular: false,
      benefits: [
        "Access to select daily live classes",
        "Library of 20+ foundational flows",
        "Community chat & instructor Q&A",
        "Multi-device access (Web & Mobile)",
        "Zero cancellation fees",
      ],
      buttonText: "Get Started Free",
      buttonVariant: "outline",
    },
    {
      name: "Monthly Membership",
      badge: "Most Popular",
      description:
        "Complete freedom and unlimited access to all live streams, masterclasses, and on-demand archives.",
      price: "₹1,499",
      period: "/ month",
      priceNote: "(Configurable Pricing Placeholder)",
      popular: true,
      benefits: [
        "Unlimited live interactive daily sessions",
        "Full archive of 200+ on-demand classes",
        "Direct alignment feedback from teachers",
        "Personalized practice recommendation engine",
        "Progress & streak analytics",
        "Exclusive weekend workshop access",
      ],
      buttonText: "Get Started Monthly",
      buttonVariant: "primary",
    },
    {
      name: "Annual Membership",
      badge: "Best Long-Term Value",
      description:
        "Deepen your practice for an entire year. Includes exclusive retreats discounts and 1-on-1 consultations.",
      price: "₹11,999",
      period: "/ year",
      priceNote: "(Configurable Pricing Placeholder)",
      popular: false,
      benefits: [
        "Everything in Monthly Membership",
        "Save over 30% compared to monthly billing",
        "Two complimentary 1-on-1 instructor sessions",
        "Priority waitlist for limited capacity masterclasses",
        "Offline downloading in the ZenFlow app",
        "Downloadable yoga journey certification",
      ],
      buttonText: "Get Started Annual",
      buttonVariant: "outline",
    },
  ];

  return (
    <section id="membership" className="py-20 md:py-28 bg-[#F8F7F2] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16 md:mb-20">
          <span className="text-xs sm:text-sm uppercase tracking-widest text-[#6B8F71] font-semibold">
            Transparent Memberships
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#233D32] tracking-tight">
            Choose Your Path to Wellness
          </h2>
          <p className="text-base sm:text-lg text-[#292D2A]/75 font-light leading-relaxed">
            Invest in your daily health with mindful pricing. Switch or pause your
            membership whenever life invites you to change pace.
          </p>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                plan.popular
                  ? "bg-[#233D32] text-[#F8F7F2] shadow-2xl lg:-translate-y-2 border-2 border-[#6B8F71]"
                  : "bg-white text-[#292D2A] border border-[#E9E2D0] hover:border-[#6B8F71]/50 shadow-sm hover:shadow-xl"
              }`}
            >
              {/* Popular Badge */}
              {plan.badge && (
                <div className="mb-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
                      plan.popular
                        ? "bg-[#6B8F71] text-[#F8F7F2]"
                        : "bg-[#E9E2D0] text-[#233D32]"
                    }`}
                  >
                    {plan.popular && <Sparkles className="w-3 h-3 text-[#E9E2D0]" />}
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Title & Description */}
              <div className="space-y-3">
                <h3
                  className={`text-2xl font-serif font-bold ${
                    plan.popular ? "text-white" : "text-[#233D32]"
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-sm leading-relaxed font-light ${
                    plan.popular ? "text-[#F8F7F2]/80" : "text-[#292D2A]/70"
                  }`}
                >
                  {plan.description}
                </p>

                {/* Price */}
                <div className="pt-4 pb-2 border-b border-current/10">
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-4xl sm:text-5xl font-serif font-bold ${
                        plan.popular ? "text-white" : "text-[#233D32]"
                      }`}
                    >
                      {plan.price}
                    </span>
                    <span
                      className={`text-sm ${
                        plan.popular ? "text-[#F8F7F2]/70" : "text-[#292D2A]/60"
                      }`}
                    >
                      {plan.period}
                    </span>
                  </div>
                  <p
                    className={`text-[11px] mt-1 ${
                      plan.popular ? "text-[#E9E2D0]/70" : "text-[#6B8F71]"
                    }`}
                  >
                    {plan.priceNote}
                  </p>
                </div>

                {/* Benefits List */}
                <div className="pt-4 space-y-3">
                  <p
                    className={`text-xs uppercase tracking-wider font-semibold ${
                      plan.popular ? "text-[#E9E2D0]" : "text-[#6B8F71]"
                    }`}
                  >
                    What&apos;s Included:
                  </p>
                  <ul className="space-y-2.5 text-sm font-light">
                    {plan.benefits.map((benefit, bIndex) => (
                      <li key={bIndex} className="flex items-start gap-2.5">
                        <Check
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            plan.popular ? "text-[#6B8F71]" : "text-[#6B8F71]"
                          }`}
                        />
                        <span
                          className={
                            plan.popular ? "text-[#F8F7F2]/90" : "text-[#292D2A]/85"
                          }
                        >
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Get Started Button */}
              <div className="pt-8 mt-6">
                <Link
                  href="/login"
                  className={`w-full inline-flex items-center justify-center py-3.5 px-6 rounded-full text-sm font-semibold transition-all duration-200 ${
                    plan.popular
                      ? "bg-[#6B8F71] hover:bg-[#57785D] text-white shadow-md hover:shadow-lg"
                      : "bg-[#233D32] hover:bg-[#6B8F71] text-[#F8F7F2] shadow-sm hover:shadow"
                  }`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Footnote reassurance */}
        <p className="mt-12 text-center text-xs text-[#292D2A]/50">
          * Prices shown are sample tier placeholders. Final plans and GST/taxes will be
          confirmed inside your membership portal.
        </p>
      </div>
    </section>
  );
}

