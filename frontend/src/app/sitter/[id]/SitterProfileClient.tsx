"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Star, ArrowLeft, ShieldCheck, CheckCircle2, Award, Clock, Users, Loader2 } from "lucide-react";
import Link from "next/link";
import { Sitter } from "@/components/SitterCard";

interface SitterProfileClientProps {
  id: string;
}

export default function SitterProfileClient({ id }: SitterProfileClientProps) {
  const router = useRouter();

  const [sitter, setSitter] = useState<Sitter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  // Cost Calculator State
  const [hours, setHours] = useState(4);
  const [petCount, setPetCount] = useState(1);

  useEffect(() => {
    const fetchSitter = async () => {
      try {
        const res = await fetch(`/api/sitters/${id}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("Sitter not found");
          throw new Error("Failed to load sitter profile");
        }
        const data = await res.json();
        setSitter(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSitter();
  }, [id]);

  const hourlyRate = sitter?.hourlyRate || 0;
  const totalCost = hourlyRate * hours * petCount;

  const avatarUrl = sitter?.profileImage || (sitter ? `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(sitter.name)}` : "");

  const bookingError: string | null = null;

  const handleBooking = () => {
    if (!sitter) return;
    setIsBooking(true);
    router.push(`/booking?sitterId=${sitter.id}`);
  };

  if (isLoading) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
        <p className="mt-4 text-lg font-medium text-slate-600">Loading profile...</p>
      </main>
    );
  }

  if (error || !sitter) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900">{error || "Sitter Not Found"}</h1>
        <p className="mt-2 text-slate-600">The sitter profile you are trying to view does not exist or has been removed.</p>
        <Link href="/directory" className="mt-6 inline-flex rounded-xl bg-slate-900 px-4 py-2 font-bold text-white transition hover:bg-slate-800">
          Return to Directory
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/directory"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to directory
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Sitter Details - Left/Center Column (Span 2) */}
        <section className="lg:col-span-2 space-y-6">
          {/* Header Block */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-6 md:p-8 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              {/* Profile Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={sitter.name}
                className="h-24 w-24 rounded-3xl object-cover border border-slate-100 shadow-md"
              />

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 border border-amber-200">
                    {sitter.category}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      sitter.availability
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-50 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {sitter.availability ? "Available Now" : "Not Available"}
                  </span>
                </div>

                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{sitter.name}</h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 font-medium">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-slate-800">{sitter.rating.toFixed(2)}</span>
                    <span className="text-slate-400">(Verified Rating)</span>
                  </div>
                  <span>•</span>
                  <span>{sitter.experience || "Professional experience"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">About {sitter.name}</h2>
            <p className="mt-4 text-slate-600 leading-relaxed text-sm md:text-base whitespace-pre-line">
              {sitter.bio || `${sitter.name} is a certified pet care professional offering premium services. They provide structured schedules, healthy play, and secure updates while managing your pets.`}
            </p>
          </div>

          {/* Certifications, Safety & Insurance */}
          <div className="grid gap-6 sm:grid-cols-2">
            
            {/* Certifications */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Award className="h-5 w-5 text-amber-500" /> Certifications
              </h3>
              <ul className="mt-4 space-y-2 flex-1">
                {sitter.certifications && sitter.certifications.length > 0 ? (
                  sitter.certifications.map((cert) => (
                    <li key={cert} className="flex items-start gap-2 text-sm text-slate-700 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{cert}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-slate-500 italic">No certifications listed</li>
                )}
              </ul>
            </div>

            {/* Safety */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldCheck className="h-5 w-5 text-amber-500" /> Safety
              </h3>
              <div className="mt-4 flex-1">
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {sitter.safety || "Completed background checks and clinical reference validations."}
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Vetted Background
                </div>
              </div>
            </div>

            {/* Insurance (Span both columns on larger screen if needed, or normal grid item) */}
            <div className="sm:col-span-2 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldCheck className="h-5 w-5 text-amber-500" /> Insurance &amp; Liability
              </h3>
              <p className="mt-3 text-sm text-slate-700 leading-relaxed font-medium">
                {sitter.insurance || "Fully bonded and covered by professional pet care liability insurance policies."}
              </p>
            </div>
          </div>
        </section>

        {/* Cost Calculator Sidebar - Right Column */}
        <aside className="space-y-6">
          <div className="sticky top-[73px] rounded-3xl border border-slate-200 bg-white p-6 shadow-md md:p-8">
            <h3 className="text-xl font-bold text-slate-900 pb-3 border-b border-slate-100">
              Cost Calculator
            </h3>

            {/* Price Details */}
            <div className="mt-6 flex items-baseline justify-between">
              <span className="text-sm text-slate-500 font-medium">Hourly Rate</span>
              <span className="text-2xl font-extrabold text-slate-950">${hourlyRate}/hr</span>
            </div>

            {/* Inputs */}
            <div className="mt-6 space-y-4">
              {/* Hours Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Service Hours
                </label>
                <div className="flex items-center">
                  <button
                    onClick={() => setHours(Math.max(1, hours - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-l-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={hours}
                    onChange={(e) => setHours(Math.max(1, parseInt(e.target.value) || 1))}
                    className="h-10 w-full border-y border-slate-200 text-center font-semibold text-slate-800 outline-none focus:bg-amber-50/20"
                  />
                  <button
                    onClick={() => setHours(hours + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-r-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Pets Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> Pet Count
                </label>
                <div className="flex items-center">
                  <button
                    onClick={() => setPetCount(Math.max(1, petCount - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-l-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={sitter.maxPetCount}
                    value={petCount}
                    onChange={(e) => setPetCount(Math.max(1, Math.min(sitter.maxPetCount, parseInt(e.target.value) || 1)))}
                    className="h-10 w-full border-y border-slate-200 text-center font-semibold text-slate-800 outline-none focus:bg-amber-50/20"
                  />
                  <button
                    onClick={() => setPetCount(Math.min(sitter.maxPetCount, petCount + 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-r-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    +
                  </button>
                </div>
                <span className="text-[10px] text-slate-400">Max pets limit: {sitter.maxPetCount}</span>
              </div>
            </div>

            {/* Calculations & Total */}
            <div className="mt-6 border-t border-dashed border-slate-200 pt-6">
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex justify-between font-medium">
                  <span>Subtotal</span>
                  <span>${hourlyRate} × {hours} hrs</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Pet Multiplier</span>
                  <span>× {petCount} {petCount === 1 ? "pet" : "pets"}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-sm font-bold text-slate-900">Estimated Cost</span>
                <span className="text-3xl font-black text-amber-600">${totalCost}</span>
              </div>
            </div>

            {/* Booking Call to Action */}
            <button
              onClick={handleBooking}
              disabled={isBooking}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3.5 text-center font-bold text-sm text-white hover:bg-amber-500 hover:text-slate-950 disabled:opacity-70 transition-all duration-200 shadow-md shadow-slate-950/10 hover:shadow-lg"
            >
              {isBooking ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              {isBooking ? "Processing..." : "Book This Sitter"}
            </button>

            {bookingError ? (
              <p className="mt-3 text-center text-sm text-red-600 font-semibold">
                {bookingError}
              </p>
            ) : (
              <p className="mt-3 text-center text-[10px] text-slate-400 font-semibold leading-relaxed">
                No immediate charges. Submitting this request sends a booking inquiry to {sitter.name}.
              </p>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
