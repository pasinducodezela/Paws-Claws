"use client";

import { useState, useEffect } from "react";
import SitterCard, { Sitter } from "@/components/SitterCard";

export default function FeaturedSittersClient() {
  const [sitters, setSitters] = useState<Sitter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSitters = async () => {
      try {
        const res = await fetch("/api/sitters?limit=3");
        if (!res.ok) throw new Error("Failed to load featured sitters");
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="inline-flex h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
        <p className="mt-4 font-medium text-slate-500">Loading featured sitters...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (sitters.length === 0) return null;

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {sitters.map((sitter) => (
        <div key={sitter.id} className="min-h-[30rem]">
          <SitterCard sitter={sitter} />
        </div>
      ))}
    </div>
  );
}
