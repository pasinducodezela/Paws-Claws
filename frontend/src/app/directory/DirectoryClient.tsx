"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, HelpCircle, Grid } from "lucide-react";
import SitterCard, { Sitter } from "@/components/SitterCard";

const CATEGORIES = ["All", "Dog Walker", "House Sitter", "Groomer", "Vet Assistant"];

export default function DirectoryClient() {
  const searchParams = useSearchParams();
  const [sitters, setSitters] = useState<Sitter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [availableOnly, setAvailableOnly] = useState(false);


  // Fetch sitters from API route on mount
  useEffect(() => {
    const fetchSitters = async () => {
      try {
        const res = await fetch("/api/sitters");
        if (!res.ok) throw new Error("Failed to load sitters");
        const data = await res.json();
        setSitters(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSitters();
  }, []);

  // Compute filtered sitters
  const filteredSitters = useMemo(() => {
    return sitters.filter((sitter) => {
      // 1. Search Query Filter (name or category matching)
      const matchesSearch =
        sitter.name.toLowerCase().includes(search.toLowerCase()) ||
        sitter.category.toLowerCase().includes(search.toLowerCase()) ||
        (sitter.bio && sitter.bio.toLowerCase().includes(search.toLowerCase()));

      // 2. Category Pill Filter
      const matchesCategory =
        selectedCategory === "All" ||
        sitter.category.toLowerCase() === selectedCategory.toLowerCase();

      // 3. Availability Filter
      const matchesAvailability = !availableOnly || sitter.availability === true;

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [sitters, search, selectedCategory, availableOnly]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Banner / Intro */}
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Find Your Perfect Pet Care Partner
        </h1>
        <p className="mt-2 text-base text-slate-600">
          Search and filter verified professional pet sitters, groomers, and helpers.
        </p>
      </div>

      {/* Filter and Search Bar Section */}
      <section className="sticky top-[73px] z-30 mb-8 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-md">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          
          {/* Search Input Container */}
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or service (e.g. Sarah, Groomer, Walker)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pr-4 pl-12 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          {/* Availability Filter */}
          <div className="flex items-center justify-end">
            <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-500 select-none">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="peer sr-only"
              />
              <div className="relative h-6 w-11 rounded-full bg-slate-200 transition-colors after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-amber-500 peer-checked:after:translate-x-5" />
              <span className="font-medium text-slate-700">Only show available</span>
            </label>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all duration-150 ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Sitters Grid or Empty State */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider inline-flex items-center gap-1.5">
            <Grid className="h-4 w-4" /> Matches ({filteredSitters.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="inline-flex h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
            <p className="mt-4 font-medium text-slate-500">Loading directory...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-red-500">
            <p>{error}</p>
          </div>
        ) : filteredSitters.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSitters.map((sitter) => (
              <SitterCard key={sitter.id} sitter={sitter} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 p-12 text-center">
            <div className="rounded-full bg-amber-50 p-4 text-amber-500">
              <HelpCircle className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">No sitters found</h3>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              We couldn&apos;t find any sitters matching your current search criteria. Try modifying your filters or clear the search.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
                setAvailableOnly(false);
              }}
              className="mt-5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
