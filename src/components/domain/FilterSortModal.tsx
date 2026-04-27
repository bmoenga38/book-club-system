"use client";

import { useEffect, useRef } from "react";

const FONT = { fontFamily: "'Space Grotesk', system-ui, sans-serif" };

type SortBy = "title" | "author" | "availability" | "publicationDate";

interface FilterSortModalProps {
  open: boolean;
  onClose: () => void;
  categories: string[];
  selectedCategory: string | undefined;
  onSelectCategory: (cat: string | undefined) => void;
  sortBy: SortBy;
  onSortChange: (s: SortBy) => void;
  availableOnly: boolean;
  onAvailableOnlyChange: (v: boolean) => void;
}

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "title", label: "Title" },
  { value: "author", label: "Author" },
  { value: "availability", label: "Availability" },
  { value: "publicationDate", label: "Publication Date" },
];

export function FilterSortModal({
  open,
  onClose,
  categories,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  availableOnly,
  onAvailableOnlyChange,
}: FilterSortModalProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  function handleReset() {
    onSortChange("title");
    onSelectCategory(undefined);
    onAvailableOnlyChange(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div
        ref={sheetRef}
        className="relative w-full max-w-lg bg-white dark:bg-[#0F2444] rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        <div className="px-6 pb-8 pt-2 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#0d1b37] dark:text-white" style={FONT}>
              Filter & Sort
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
            >
              <span className="material-symbols-outlined text-sm text-gray-500 dark:text-gray-300">close</span>
            </button>
          </div>

          {/* Sort By */}
          <section className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#795900] dark:text-[#F5C400]">
              Sort By
            </h3>
            <div className="space-y-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onSortChange(opt.value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                    sortBy === opt.value
                      ? "bg-[#ffdf9f]/20 dark:bg-[#F5C400]/10 border border-[#ffdf9f] dark:border-[#F5C400]/30"
                      : "bg-gray-50 dark:bg-white/5 border border-transparent hover:bg-gray-100 dark:hover:bg-white/10"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      sortBy === opt.value
                        ? "border-[#795900] dark:border-[#F5C400]"
                        : "border-gray-300 dark:border-gray-500"
                    }`}
                  >
                    {sortBy === opt.value && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#795900] dark:bg-[#F5C400]" />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    sortBy === opt.value
                      ? "text-[#795900] dark:text-[#F5C400]"
                      : "text-[#45464d] dark:text-gray-300"
                  }`}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Categories */}
          {categories.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#795900] dark:text-[#F5C400]">
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onSelectCategory(undefined)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    !selectedCategory
                      ? "bg-[#ffdf9f] dark:bg-[#F5C400] text-[#261a00] dark:text-[#051029]"
                      : "bg-gray-100 dark:bg-white/10 text-[#45464d] dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => onSelectCategory(cat === selectedCategory ? undefined : cat)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                      selectedCategory === cat
                        ? "bg-[#ffdf9f] dark:bg-[#F5C400] text-[#261a00] dark:text-[#051029]"
                        : "bg-gray-100 dark:bg-white/10 text-[#45464d] dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Available Only Toggle */}
          <section className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#795900] dark:text-[#F5C400]">
              Availability
            </h3>
            <button
              onClick={() => onAvailableOnlyChange(!availableOnly)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
            >
              <span className="text-sm font-medium text-[#45464d] dark:text-gray-300">
                Show available only
              </span>
              <div
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  availableOnly
                    ? "bg-[#795900] dark:bg-[#F5C400]"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    availableOnly ? "translate-x-[22px]" : "translate-x-0.5"
                  }`}
                />
              </div>
            </button>
          </section>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleReset}
              className="flex-1 h-12 border-2 border-gray-200 dark:border-white/20 rounded-xl text-sm font-bold text-[#45464d] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all active:scale-[0.98]"
            >
              Reset All
            </button>
            <button
              onClick={onClose}
              className="flex-1 h-12 bg-[#ffdf9f] dark:bg-[#F5C400] rounded-xl text-sm font-bold text-[#261a00] dark:text-[#051029] hover:opacity-90 transition-all active:scale-[0.98] shadow-lg shadow-[#ffdf9f]/30 dark:shadow-[#F5C400]/20"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
