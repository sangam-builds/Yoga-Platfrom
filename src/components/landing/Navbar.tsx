"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Sparkles } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "#" },
    { label: "Classes", href: "#classes" },
    { label: "Membership", href: "#membership" },
    { label: "Instructors", href: "#instructors" },
    { label: "About Us", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#F8F7F2]/90 backdrop-blur-md shadow-sm border-b border-[#E9E2D0]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Brand Logo */}
          <Link href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-[#233D32] flex items-center justify-center text-[#F8F7F2] shadow-sm group-hover:bg-[#6B8F71] transition-colors">
              {/* Lotus / Yoga Inspired SVG Icon */}
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
            <div className="flex flex-col">
              <span className="font-serif text-2xl tracking-tight text-[#233D32] font-semibold">
                ZenFlow
              </span>
              <span className="text-[10px] tracking-widest uppercase text-[#6B8F71] font-medium -mt-1">
                Yoga Sanctuary
              </span>
            </div>
          </Link>

          {/* Center: Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-[#292D2A]/80 hover:text-[#233D32] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#6B8F71] hover:after:w-full after:transition-all"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right: One Prominent "Get Started" Button */}
          <div className="hidden md:flex items-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-medium bg-[#233D32] text-[#F8F7F2] hover:bg-[#6B8F71] transition-all duration-200 shadow-sm hover:shadow"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#233D32] hover:bg-[#E9E2D0]/50 transition-colors focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F8F7F2] border-b border-[#E9E2D0] px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-base font-medium text-[#292D2A] hover:bg-[#E9E2D0]/50 hover:text-[#233D32] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-base font-medium bg-[#233D32] text-[#F8F7F2] hover:bg-[#6B8F71] transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-[#E9E2D0]" />
              <span>Get Started</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

