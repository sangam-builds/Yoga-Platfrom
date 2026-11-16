"use client";

import { useState, useEffect } from "react";

export function useRazorpayScript() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If already loaded in window
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      setIsLoaded(true);
      setIsLoading(false);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      setIsLoaded(true);
      setIsLoading(false);
    };

    script.onerror = () => {
      setError("Failed to load Razorpay payment SDK.");
      setIsLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      // Keep script attached to prevent multiple reloads
    };
  }, []);

  return { isLoaded, isLoading, error };
}
