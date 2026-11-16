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
        className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center px-4 py-3.5 border-b border-gray-200 dark:border-gray-800 gap-3">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search classes, instructors, poses... (e.g. Vinyasa, Priya, Surya Namaskar)"
            className="w-full bg-transparent text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-700">
            ESC
          </kbd>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {isLoading && (
            <div className="py-8 text-center text-xs text-gray-500 dark:text-gray-400">
              Searching yoga catalog...
            </div>
          )}

          {!isLoading && query && results.length === 0 && (
            <div className="py-8 text-center space-y-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No results found</p>
              <p className="text-xs text-gray-500">Try searching for styles like &ldquo;Hatha&rdquo; or &ldquo;Meditation&rdquo;</p>
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
                      className={`w-full text-left flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                        isSelected
                          ? "bg-[#6B8F71]/15 text-[#233D32] dark:text-[#A7C4B5]"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 text-gray-600 dark:text-gray-400">
                        {item.type === "class" && <Calendar className="w-4 h-4" />}
                        {item.type === "instructor" && <User className="w-4 h-4" />}
                        {item.type === "pose" && <Sparkles className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{item.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.subtitle}</p>
                      </div>
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                        {item.type}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {!query && (
            <div className="p-4 text-xs text-gray-500 dark:text-gray-400 space-y-2">
              <p className="font-semibold text-gray-700 dark:text-gray-300">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {["Vinyasa Flow", "Morning Hatha", "Priya Sharma", "Sun Salutation", "Yin for Sleep"].map(
                  (suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setQuery(suggestion)}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-[#6B8F71]/15 text-gray-700 dark:text-gray-300 transition-colors"
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

