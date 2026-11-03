"use client";

import React, { createContext, useContext, useState, useEffect, useTransition } from "react";

export type Locale = "en" | "hi" | "pa";

export interface I18nContextType {
  locale: Locale;
  setLocale: (newLocale: Locale) => void;
  t: (key: string, fallback?: string) => string;
  formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatTime: (date: Date | string | number, timezone?: string) => string;
  formatCurrency: (paise: number, currency?: string) => string;
  timezone: string;
  setTimezone: (tz: string) => void;
}

export const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Nav items
    "nav.overview": "Overview",
    "nav.schedule": "Schedule",
    "nav.bookings": "My Bookings",
    "nav.membership": "Membership",
    "nav.attendance": "Attendance",
    "nav.certificates": "Certificates",
    "nav.recordings": "Recordings",
    "nav.journal": "Journal",
    "nav.poses": "Pose Library",
    "nav.assistant": "AI Assistant",
    "nav.settings": "Settings",
    "nav.more": "More",
    "nav.logout": "Log out",
    "nav.profile": "Profile",
    "nav.billing": "Billing",

    // General
    "common.loading": "Loading...",
    "common.retry": "Retry",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.save": "Save Changes",
    "common.close": "Close",
    "common.viewDetails": "View Details",
    "common.book": "Book Class",
    "common.join": "Join Class",
    "common.liveNow": "Live Now",
    "common.search": "Search classes, instructors, poses...",
    "common.noData": "No data available",
    "common.undo": "Undo",
    "common.copy": "Copy",
    "common.copied": "Copied to clipboard!",

    // Statuses
    "status.active": "Active",
    "status.trialing": "Trialing",
    "status.paused": "Paused",
    "status.past_due": "Past Due",
    "status.cancelled": "Cancelled",
    "status.booked": "Booked",
    "status.waitlisted": "Waitlisted",
    "status.completed": "Completed",
    "status.attended": "Attended",
    "status.missed": "Missed",
    "status.open": "Spots Open",
    "status.fewSpots": "Few Spots Left",
    "status.full": "Full (Waitlist)",

    // Overview
    "overview.welcomeMorning": "Good morning",
    "overview.welcomeAfternoon": "Good afternoon",
    "overview.welcomeEvening": "Good evening",
    "overview.streakActive": "You're on fire! Keep your daily mindfulness unbroken.",
    "overview.streakNone": "Begin your yoga journey today with a mindful session.",
    "overview.nextClass": "Your Next Class",
    "overview.noUpcoming": "No upcoming bookings. Browse the schedule to book a session.",
    "overview.browseSchedule": "Browse Schedule",
    "overview.streak": "Current Streak",
    "overview.totalClasses": "Total Classes",
    "overview.totalHours": "Hours Practiced",
    "overview.thisMonth": "Classes This Month",
    "overview.recommended": "Recommended For You",
    "overview.quickActions": "Quick Actions",
    "overview.attendanceHeatmap": "12-Week Attendance",
    "overview.milestoneProgress": "Milestone to Next Certificate",
    "overview.badgesEarned": "Recent Achievements",

    // Live Room
    "live.micOn": "Mute Mic",
    "live.micOff": "Unmute Mic",
    "live.camOn": "Stop Camera",
    "live.camOff": "Start Camera",
    "live.raiseHand": "Raise Hand",
    "live.leaveClass": "Leave Room",
    "live.preJoinTitle": "Audio & Video Check",
    "live.readyToJoin": "You are all set to join!",

    // Settings
    "settings.title": "Account & Preferences",
    "settings.profile": "Profile Info",
    "settings.preferences": "Yoga Preferences",
    "settings.notifications": "Notifications",
    "settings.security": "Security",
    "settings.privacy": "Privacy & Data",
  },
  hi: {
    // Nav items
    "nav.overview": "अवलोकन",
    "nav.schedule": "समय-सारणी",
    "nav.bookings": "मेरी बुकिंग",
    "nav.membership": "सदस्यता",
    "nav.attendance": "उपस्थिति",
    "nav.certificates": "प्रमाणपत्र",
    "nav.recordings": "रिकॉर्डिंग",
    "nav.journal": "दैनिक पत्रिका",
    "nav.poses": "आसन सूची",
    "nav.assistant": "एआई सहायक",
    "nav.settings": "सेटिंग्स",
    "nav.more": "अधिक",
    "nav.logout": "लॉग आउट",
    "nav.profile": "प्रोफ़ाइल",
    "nav.billing": "बिलिंग",

    // General
    "common.loading": "लोड हो रहा है...",
    "common.retry": "पुनः प्रयास करें",
    "common.cancel": "रद्द करें",
    "common.confirm": "पुष्टि करें",
    "common.save": "परिवर्तन सहेजें",
    "common.close": "बंद करें",
    "common.viewDetails": "विवरण देखें",
    "common.book": "कक्षा बुक करें",
    "common.join": "कक्षा में जुड़ें",
    "common.liveNow": "लाइव चालू है",
    "common.search": "कक्षाएं, प्रशिक्षक या आसन खोजें...",
    "common.noData": "कोई डेटा उपलब्ध नहीं है",
    "common.undo": "पूर्ववत करें",
    "common.copy": "कॉपी करें",
    "common.copied": "कॉपी हो गया!",

    // Statuses
    "status.active": "सक्रिय",
    "status.trialing": "परीक्षण",
    "status.paused": "रोका गया",
    "status.past_due": "अतिदेय",
    "status.cancelled": "रद्द किया गया",
    "status.booked": "आरक्षित",
    "status.waitlisted": "प्रतीक्षा सूची",
    "status.completed": "पूर्ण",
    "status.attended": "उपस्थित",
    "status.missed": "अनुपस्थित",
    "status.open": "स्थान उपलब्ध",
    "status.fewSpots": "कुछ ही स्थान शेष",
    "status.full": "पूर्ण (प्रतीक्षा)",

    // Overview
    "overview.welcomeMorning": "शुभ प्रभात",
    "overview.welcomeAfternoon": "शुभ दोपहर",
    "overview.welcomeEvening": "शुभ संध्या",
    "overview.streakActive": "अद्भुत निरंतरता! अपने दैनिक योग अभ्यास को जारी रखें।",
    "overview.streakNone": "आज ही एक शांतिपूर्ण योग सत्र के साथ अपनी यात्रा शुरू करें।",
    "overview.nextClass": "आपकी अगली कक्षा",
    "overview.noUpcoming": "कोई आगामी बुकिंग नहीं है। समय-सारणी देखें।",
    "overview.browseSchedule": "कक्षाएं देखें",
    "overview.streak": "वर्तमान निरंतरता",
    "overview.totalClasses": "कुल कक्षाएं",
    "overview.totalHours": "अभ्यास के घंटे",
    "overview.thisMonth": "इस महीने की कक्षाएं",
    "overview.recommended": "आपके लिए अनुशंसित",
    "overview.quickActions": "त्वरित क्रियाएं",
    "overview.attendanceHeatmap": "12 सप्ताह की उपस्थिति",
    "overview.milestoneProgress": "अगले प्रमाणपत्र की प्रगति",
    "overview.badgesEarned": "हाल की उपलब्धियां",

    // Live Room
    "live.micOn": "माइक म्यूट करें",
    "live.micOff": "माइक चालू करें",
    "live.camOn": "कैमरा बंद करें",
    "live.camOff": "कैमरा चालू करें",
    "live.raiseHand": "हाथ उठाएं",
    "live.leaveClass": "कक्षा छोड़ें",
    "live.preJoinTitle": "ऑडियो एवं वीडियो जांच",
    "live.readyToJoin": "आप जुड़ने के लिए पूरी तरह तैयार हैं!",

    // Settings
    "settings.title": "खाता एवं प्राथमिकताएं",
    "settings.profile": "प्रोफ़ाइल जानकारी",
    "settings.preferences": "योग प्राथमिकताएं",
    "settings.notifications": "सूचनाएं",
    "settings.security": "सुरक्षा",
    "settings.privacy": "गोपनीयता एवं डेटा",
  },
  pa: {
    // Nav items
    "nav.overview": "ਸੰਖੇਪ",
    "nav.schedule": "ਸਮਾਂ-ਸਾਰਣੀ",
    "nav.bookings": "ਮੇਰੀਆਂ ਬੁਕਿੰਗਾਂ",
    "nav.membership": "ਮੈਂਬਰਸ਼ਿਪ",
    "nav.attendance": "ਹਾਜ਼ਰੀ",
    "nav.certificates": "ਸਰਟੀਫਿਕੇਟ",
    "nav.recordings": "ਰਿਕਾਰਡਿੰਗਾਂ",
    "nav.journal": "ਡਾਇਰੀ",
    "nav.poses": "ਆਸਣ ਲਾਇਬ੍ਰੇਰੀ",
    "nav.assistant": "ਏਆਈ ਸਹਾਇਕ",
    "nav.settings": "ਸੈਟਿੰਗਾਂ",
    "nav.more": "ਹੋਰ",
    "nav.logout": "ਲਾਗ ਆਉਟ",
    "nav.profile": "ਪ੍ਰੋਫਾਈਲ",
    "nav.billing": "ਬਿਲਿੰਗ",

    // General
    "common.loading": "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
    "common.retry": "ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ",
    "common.cancel": "ਰੱਦ ਕਰੋ",
    "common.confirm": "ਪੁਸ਼ਟੀ ਕਰੋ",
    "common.save": "ਤਬਦੀਲੀਆਂ ਸਾਂਭੋ",
    "common.close": "ਬੰਦ ਕਰੋ",
    "common.viewDetails": "ਵੇਰਵਾ ਦੇਖੋ",
    "common.book": "ਕਲਾਸ ਬੁੱਕ ਕਰੋ",
    "common.join": "ਕਲਾਸ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ",
    "common.liveNow": "ਲਾਈਵ ਚੱਲ ਰਿਹਾ ਹੈ",
    "common.search": "ਕਲਾਸਾਂ, ਅਧਿਆਪਕ ਜਾਂ ਆਸਣ ਖੋਜੋ...",
    "common.noData": "ਕੋਈ ਡਾਟਾ ਉਪਲਬਧ ਨਹੀਂ",
    "common.undo": "ਵਾਪਸ ਕਰੋ",
    "common.copy": "ਕਾਪੀ ਕਰੋ",
    "common.copied": "ਕਾਪੀ ਹੋ ਗਿਆ!",

    // Statuses
    "status.active": "ਸਰਗਰਮ",
    "status.trialing": "ਪਰੀਖਣ",
    "status.paused": "ਰੋਕਿਆ ਗਿਆ",
    "status.past_due": "ਬਕਾਇਆ",
    "status.cancelled": "ਰੱਦ ਕੀਤਾ ਗਿਆ",
    "status.booked": "ਬੁੱਕ ਕੀਤਾ",
    "status.waitlisted": "ਉਡੀਕ ਸੂਚੀ",
    "status.completed": "ਮੁਕੰਮਲ",
    "status.attended": "ਹਾਜ਼ਰ",
    "status.missed": "ਗ਼ੈਰ-ਹਾਜ਼ਰ",
    "status.open": "ਸੀਟਾਂ ਉਪਲਬਧ",
    "status.fewSpots": "ਕੁਝ ਸੀਟਾਂ ਬਾਕੀ",
    "status.full": "ਭਰਿਆ ਹੋਇਆ",

    // Overview
    "overview.welcomeMorning": "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ",
    "overview.welcomeAfternoon": "ਸ਼ੁਭ ਦੁਪਹਿਰ",
    "overview.welcomeEvening": "ਸ਼ੁਭ ਸੰਝ",
    "overview.streakActive": "ਬਹੁਤ ਵਧੀਆ! ਆਪਣਾ ਰੋਜ਼ਾਨਾ ਯੋਗਾ ਅਭਿਆਸ ਜਾਰੀ ਰੱਖੋ।",
    "overview.streakNone": "ਅੱਜ ਹੀ ਇੱਕ ਸ਼ਾਂਤ ਯੋਗ ਸੈਸ਼ਨ ਨਾਲ ਸ਼ੁਰੂਆਤ ਕਰੋ।",
    "overview.nextClass": "ਤੁਹਾਡੀ ਅਗਲੀ ਕਲਾਸ",
    "overview.noUpcoming": "ਕੋਈ ਆਉਣ ਵਾਲੀ ਬੁਕਿੰਗ ਨਹੀਂ ਹੈ। ਸਮਾਂ-ਸਾਰਣੀ ਦੇਖੋ।",
    "overview.browseSchedule": "ਕਲਾਸਾਂ ਦੇਖੋ",
    "overview.streak": "ਲਗਾਤਾਰ ਦਿਨ",
    "overview.totalClasses": "ਕੁੱਲ ਕਲਾਸਾਂ",
    "overview.totalHours": "ਅਭਿਆਸ ਦੇ ਘੰਟੇ",
    "overview.thisMonth": "ਇਸ ਮਹੀਨੇ ਕਲਾਸਾਂ",
    "overview.recommended": "ਤੁਹਾਡੇ ਲਈ ਸਿਫ਼ਾਰਸ਼ ਕੀਤੀਆਂ",
    "overview.quickActions": "ਤੁਰੰਤ ਕਿਰਿਆਵਾਂ",
    "overview.attendanceHeatmap": "12 ਹਫ਼ਤਿਆਂ ਦੀ ਹਾਜ਼ਰੀ",
    "overview.milestoneProgress": "ਅਗਲੇ ਸਰਟੀਫਿਕੇਟ ਦੀ ਤਰੱਕੀ",
    "overview.badgesEarned": "ਹਾਲੀਆ ਪ੍ਰਾਪਤੀਆਂ",

    // Live Room
    "live.micOn": "ਮਾਈਕ ਬੰਦ ਕਰੋ",
    "live.micOff": "ਮਾਈਕ ਚਾਲੂ ਕਰੋ",
    "live.camOn": "ਕੈਮਰਾ ਬੰਦ ਕਰੋ",
    "live.camOff": "ਕੈਮਰਾ ਚਾਲੂ ਕਰੋ",
    "live.raiseHand": "ਹੱਥ ਖੜ੍ਹਾ ਕਰੋ",
    "live.leaveClass": "ਕਲਾਸ ਛੱਡੋ",
    "live.preJoinTitle": "ਆਡੀਓ ਅਤੇ ਵੀਡੀਓ ਜਾਂਚ",
    "live.readyToJoin": "ਤੁਸੀਂ ਸ਼ਾਮਲ ਹੋਣ ਲਈ ਤਿਆਰ ਹੋ!",

    // Settings
    "settings.title": "ਖਾਤਾ ਅਤੇ ਤਰਜੀਹਾਂ",
    "settings.profile": "ਪ੍ਰੋਫਾਈਲ ਜਾਣਕਾਰੀ",
    "settings.preferences": "ਯੋਗਾ ਤਰਜੀਹਾਂ",
    "settings.notifications": "ਸੂਚਨਾਵਾਂ",
    "settings.security": "ਸੁਰੱਖਿਆ",
    "settings.privacy": "ਪ੍ਰਾਈਵੇਸੀ ਅਤੇ ਡਾਟਾ",
  },
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({
  children,
  initialLocale = "en",
  initialTimezone = "Asia/Kolkata",
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
  initialTimezone?: string;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [timezone, setTimezoneState] = useState<string>(initialTimezone);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const savedLocale = localStorage.getItem("zenflow_locale") as Locale;
    if (savedLocale && ["en", "hi", "pa"].includes(savedLocale)) {
      setLocaleState(savedLocale);
    }
    const savedTz = localStorage.getItem("zenflow_timezone");
    if (savedTz) {
      setTimezoneState(savedTz);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    startTransition(() => {
      setLocaleState(newLocale);
      localStorage.setItem("zenflow_locale", newLocale);
      // Synchronize with server profile non-blockingly
      fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: newLocale }),
      }).catch(() => {});
    });
  };

  const setTimezone = (newTz: string) => {
    setTimezoneState(newTz);
    localStorage.setItem("zenflow_timezone", newTz);
    fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timezone: newTz }),
    }).catch(() => {});
  };

  const t = (key: string, fallback?: string): string => {
    return translations[locale]?.[key] || translations.en[key] || fallback || key;
  };

  const formatDate = (dateInput: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "";
    const localeCode = locale === "hi" ? "hi-IN" : locale === "pa" ? "pa-IN" : "en-IN";
    return new Intl.DateTimeFormat(localeCode, {
      timeZone: timezone,
      dateStyle: options?.dateStyle || "medium",
      ...options,
    }).format(date);
  };

  const formatTime = (dateInput: Date | string | number, customTz?: string) => {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "";
    const tzToUse = customTz || timezone;
    const localeCode = locale === "hi" ? "hi-IN" : locale === "pa" ? "pa-IN" : "en-IN";
    const formatted = new Intl.DateTimeFormat(localeCode, {
      timeZone: tzToUse,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
    return `${formatted} (${tzToUse.split("/")[1]?.replace("_", " ") || tzToUse})`;
  };

  const formatCurrency = (paise: number, currency = "INR") => {
    const amount = paise / 100;
    const localeCode = locale === "hi" ? "hi-IN" : locale === "pa" ? "pa-IN" : "en-IN";
    return new Intl.NumberFormat(localeCode, {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        formatDate,
        formatTime,
        formatCurrency,
        timezone,
        setTimezone,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
