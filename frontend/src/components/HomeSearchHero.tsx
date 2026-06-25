"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, PawPrint, Filter, X } from "lucide-react";

const CATEGORIES = ["Dog Walker", "House Sitter", "Groomer", "Vet Assistant"];
const MOCK_SUGGESTIONS = ["Sarah Wilson", "Dog Walking", "House Sitting", "Professional Grooming", "Vet Care"];

export function HomeSearchHero() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const router = useRouter();

  const suggestions = useMemo(
    () =>
      query.trim().length > 0
        ? MOCK_SUGGESTIONS.filter((s) => s.toLowerCase().includes(query.toLowerCase()))
        : [],
    [query]
  );
  const showSuggestions = suggestions.length > 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Track search event (basic analytics)
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "search", {
        search_term: query,
        category: category,
        timestamp: new Date().toISOString(),
      });
    }
    
    const params = new URLSearchParams();
    if (query.trim()) params.append("search", query.trim());
    if (category) params.append("category", category);
    
    router.push(`/directory?${params.toString()}`);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/50 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur-xl md:p-14">
      {/* Background Decorative Blob */}
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-amber-300/15 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-orange-200/10 blur-3xl" />

      <div className="relative z-10 max-w-3xl space-y-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-900">
          <PawPrint className="h-4 w-4 text-amber-600 fill-amber-50/20" />
          Vetted Pet Care Professionals
        </span>

        <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6.5xl leading-[1.05]">
          Find Trusted Pet Care <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Near You</span>
        </h1>
        
        <p className="max-w-xl text-base leading-relaxed text-slate-600 md:text-lg font-medium">
          Browse verified sitters, dog walkers, groomers, and vet assistants. Professional care customized for your furry family members.
        </p>

        {/* Interactive Search Bar with Filters */}
        <form onSubmit={handleSearch} className="max-w-3xl space-y-3">
          <div className="relative flex flex-col gap-3 rounded-[1.5rem] border border-slate-200 bg-white/90 p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-400/10 transition-all">
            {/* Filter Chip */}
            {category && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-900 rounded-full w-fit text-xs font-semibold">
                <Filter className="h-3.5 w-3.5" />
                {category}
                <button
                  type="button"
                  title="Clear category filter"
                  onClick={() => setCategory("")}
                  className="ml-1 hover:text-amber-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search sitters by name, service, or specialty..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent py-3 pr-4 pl-12 text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none"
                  autoComplete="off"
                />
              </div>

              {/* Category Dropdown */}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                title="Filter by service category"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              >
                <option value="">All Services</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Submit Button */}
              <button
                type="submit"
                className="rounded-2xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white font-extrabold text-sm py-3.5 px-8 transition duration-200 flex items-center justify-center gap-2 shadow-md btn-animate whitespace-nowrap"
              >
                <Search className="h-4 w-4" />
                Search
              </button>
            </div>
          </div>

          {/* Autocomplete Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full mt-2 max-w-3xl left-0 right-0 rounded-2xl border border-slate-200 bg-white shadow-lg z-50">
              <div className="p-2">
                <p className="text-xs font-semibold text-slate-400 px-3 py-2">Suggestions</p>
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-amber-50 text-sm font-medium text-slate-700 transition"
                  >
                    <Search className="h-3.5 w-3.5 inline mr-2 text-slate-400" />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
