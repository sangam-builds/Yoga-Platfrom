import React from "react";
import { Mail, MapPin, Clock } from "lucide-react";

export function Contact() {
  return (
    <section id="contact" className="py-20 md:py-28 bg-[#F8F7F2] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <span className="text-xs sm:text-sm uppercase tracking-widest text-[#6B8F71] font-semibold">
            We Are Here To Assist You
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#233D32] tracking-tight">
            Connect With Our Team
          </h2>
          <p className="text-base sm:text-lg text-[#292D2A]/75 font-light leading-relaxed">
            Have questions regarding personalized yoga plans, corporate memberships, or
            technical onboarding? Our support guides are ready to assist.
          </p>
        </div>

        {/* Contact Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-[#E9E2D0] shadow-xs text-center flex flex-col items-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E9E2D0]/50 text-[#233D32] flex items-center justify-center">
              <Mail className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="text-lg font-serif font-semibold text-[#233D32]">
              Email Assistance
            </h3>
            <p className="text-xs text-[#292D2A]/70 font-light">
              We respond promptly within 24 business hours.
            </p>
            <a
              href="mailto:support@zenflow.yoga"
              className="text-sm font-semibold text-[#6B8F71] hover:underline pt-2"
            >
              support@zenflow.yoga
            </a>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-[#E9E2D0] shadow-xs text-center flex flex-col items-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E9E2D0]/50 text-[#233D32] flex items-center justify-center">
              <Clock className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="text-lg font-serif font-semibold text-[#233D32]">
              Live Studio Hours
            </h3>
            <p className="text-xs text-[#292D2A]/70 font-light">
              Classes running 7 days a week across timezones.
            </p>
            <p className="text-sm font-semibold text-[#233D32] pt-2">
              Daily 5:30 AM – 9:30 PM IST
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-[#E9E2D0] shadow-xs text-center flex flex-col items-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E9E2D0]/50 text-[#233D32] flex items-center justify-center">
              <MapPin className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="text-lg font-serif font-semibold text-[#233D32]">
              Sanctuary Headquarters
            </h3>
            <p className="text-xs text-[#292D2A]/70 font-light">
              Virtual streams with studios in Rishikesh & Bengaluru.
            </p>
            <p className="text-sm font-semibold text-[#233D32] pt-2">
              108 Prana Way, Rishikesh, UK
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
