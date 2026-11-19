"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, Info, X, Undo2 } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  onUndo?: () => void;
  undoLabel?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => string;
  removeToast: (id: string) => void;
  toast: {
    success: (title: string, message?: string, onUndo?: () => void) => void;
    error: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ duration = 5000, ...rest }: Omit<ToastItem, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, duration, ...rest };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
      return id;
    },
    [removeToast]
  );

  const toastHelpers = {
    success: (title: string, message?: string, onUndo?: () => void) => {
      addToast({ type: "success", title, message, onUndo });
    },
    error: (title: string, message?: string) => {
      addToast({ type: "error", title, message, duration: 7000 });
    },
    info: (title: string, message?: string) => {
      addToast({ type: "info", title, message });
    },
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast: toastHelpers }}>
      {children}
      {/* Toast viewport */}
      <div
        aria-live="polite"
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md bg-[var(--bg-surface)]/95 border-[var(--border-subtle)] transition-all animate-in slide-in-from-bottom-3 font-figtree select-none"
          >
            {item.type === "success" && (
              <CheckCircle2 className="w-5 h-5 text-[var(--primary-sage)] shrink-0 mt-0.5" />
            )}
            {item.type === "error" && (
              <AlertTriangle className="w-5 h-5 text-[var(--negative-rose)] shrink-0 mt-0.5" />
            )}
            {item.type === "info" && (
              <Info className="w-5 h-5 text-[var(--info-teal)] shrink-0 mt-0.5" />
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)] font-outfit">{item.title}</p>
              {item.message && (
                <p className="text-xs text-[var(--text-muted)] mt-0.5 font-figtree">{item.message}</p>
              )}
              {item.onUndo && (
                <button
                  type="button"
                  onClick={() => {
                    item.onUndo?.();
                    removeToast(item.id);
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary-sage)] hover:underline transition-colors cursor-pointer"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>{item.undoLabel || "Undo"}</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => removeToast(item.id)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1 cursor-pointer"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

