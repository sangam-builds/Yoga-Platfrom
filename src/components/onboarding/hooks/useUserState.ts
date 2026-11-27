"use client";

import { useState, useEffect, useCallback } from "react";
import type { UserState } from "@/modules/lifecycle/lifecycle.state";

export function useUserState() {
  const [state, setState] = useState<UserState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchState = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/me/state");
      if (!res.ok) {
        if (res.status === 401) {
          setState(null);
          return;
        }
        throw new Error("Failed to load user state");
      }
      const data: UserState = await res.json();
      setState(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load state");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const dismissChecklist = useCallback(async () => {
    try {
      await fetch("/api/me/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dismiss_checklist" }),
      });
      setState((prev) =>
        prev
          ? {
              ...prev,
              checklist: { ...prev.checklist, visible: false },
              flags: { ...prev.flags, isChecklistDismissed: true },
            }
          : null
      );
    } catch {
      // Ignore
    }
  }, []);

  return {
    state,
    isLoading,
    error,
    refetch: fetchState,
    dismissChecklist,
  };
}
