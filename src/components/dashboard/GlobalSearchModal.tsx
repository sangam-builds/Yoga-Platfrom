"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Calendar, User, Sparkles, BookOpen } from "lucide-react";

interface SearchResult {
  type: "class" | "instructor" | "pose";
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

export function GlobalSearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setSelectedIndex(0);
        }
      } catch {
        // non-blocking
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation: Escape, Up, Down, Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      router.push(results[selectedIndex].href);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global search"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[var(--bg-surface)] rounded-2xl shadow-2xl border border-[var(--border-subtle)] overflow-hidden font-figtree select-none"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center px-4 py-3.5 border-b border-[var(--border-hairline)] gap-3">
          <Search className="w-5 h-5 text-[var(--text-subtle)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search classes, instructors, poses... (e.g. Vinyasa, Priya, Surya Namaskar)"
            className="w-full bg-transparent text-sm sm:text-base text-[var(--text-primary)] placeholder-[var(--text-subtle)] focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-elevated)] rounded-md border border-[var(--border-subtle)]">
            ESC
          </kbd>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {isLoading && (
            <div className="py-8 text-center text-xs text-[var(--text-muted)]">
              Searching yoga catalog...
            </div>
          )}

          {!isLoading && query && results.length === 0 && (
            <div className="py-8 text-center space-y-1">
              <p className="text-sm font-medium text-[var(--text-primary)]">No results found</p>
              <p className="text-xs text-[var(--text-muted)]">Try searching for styles like &ldquo;Hatha&rdquo; or &ldquo;Meditation&rdquo;</p>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <ul className="space-y-1">
              {results.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <li key={`${item.type}-${item.id}`}>
                    <button
                      type="button"
                      onClick={() => {
                        router.push(item.href);
                        onClose();
                      }}
                      className={`w-full text-left flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[var(--sage-tint)] text-[var(--primary-sage)] font-semibold shadow-2xs"
                          : "hover:bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[var(--sage-tint)] flex items-center justify-center shrink-0 text-[var(--sage-tint-icon)]">
                        {item.type === "class" && <Calendar className="w-4 h-4" />}
                        {item.type === "instructor" && <User className="w-4 h-4" />}
                        {item.type === "pose" && <Sparkles className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate font-outfit">{item.title}</p>
                        <p className="text-xs text-[var(--text-muted)] truncate">{item.subtitle}</p>
                      </div>
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-[var(--text-subtle)] bg-[var(--bg-elevated)] border border-[var(--border-hairline)] px-2 py-0.5 rounded-md">
                        {item.type}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {!query && (
            <div className="p-4 text-xs text-[var(--text-muted)] space-y-2">
              <p className="font-semibold text-[var(--text-primary)] font-outfit">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {["Vinyasa Flow", "Morning Hatha", "Priya Sharma", "Sun Salutation", "Yin for Sleep"].map(
                  (suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setQuery(suggestion)}
                      className="px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--primary-sage)] hover:text-[var(--primary-sage)] text-[var(--text-muted)] transition-colors cursor-pointer"
                    >
                      {suggestion}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

