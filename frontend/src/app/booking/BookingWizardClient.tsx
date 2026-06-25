"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import { Sitter } from "@/components/SitterCard";

const PET_TYPES = ["Dog", "Cat", "Bird", "Small Pet", "Other"];

export default function BookingWizardClient() {
  const searchParams = useSearchParams();
  const sitterId = searchParams.get("sitterId") || "";

  const [sitter, setSitter] = useState<Sitter | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [petType, setPetType] = useState(PET_TYPES[0]);
  const [petCount, setPetCount] = useState(1);
  const [bookingDate, setBookingDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Record<string, any> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!sitterId) {
      Promise.resolve().then(() => {
        setError("Missing sitter selection. Please choose a sitter from the directory.");
        setLoading(false);
      });
      return;
    }

    const fetchSitter = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/sitters/${sitterId}`);
        if (!res.ok) {
          throw new Error("Unable to load sitter details.");
        }
        const data = await res.json();
        setSitter(data);
        setPetCount(1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong while loading the sitter.");
      } finally {
        setLoading(false);
      }
    };

    fetchSitter();
  }, [sitterId]);

  const stepTitle = ["Your Info", "Pet Details", "Confirm Booking"];

  const nextStep = () => {
    setError(null);
    if (step === 1) {
      if (!name.trim() || !email.trim() || !phone.trim() || !address.trim()) {
        setError("Please enter your name, email, phone number, and service address.");
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (petCount < 1) {
        setError("Add at least one pet for the booking.");
        return;
      }
      if (sitter && petCount > sitter.maxPetCount) {
        setError(`This sitter can only care for up to ${sitter.maxPetCount} pet(s).`);
        return;
      }
      setStep(3);
      return;
    }
  };

  const prevStep = () => {
    setError(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!sitter) return;
    setError(null);

    if (!bookingDate) {
      setError("Please choose a future booking date.");
      return;
    }

    const requestedDate = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (requestedDate <= today) {
      setError("Future date required.");
      return;
    }

    if (petCount > sitter.maxPetCount) {
      setError(`This sitter can only care for up to ${sitter.maxPetCount} pet(s).`);
      setStep(2);
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sitterId,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          serviceAddress: address,
          serviceType: "Pet Care Service",
          petType,
          bookingDate: requestedDate.toISOString(),
          petCount,
          hours: 4,
          notes,
          status: "UNDER_REVIEW",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Booking submission failed.");
      }
      setCreatedBooking(data.booking || null);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit booking.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-5xl items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
      </main>
    );
  }

  if (error && !sitter) {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-5xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
        <p className="text-lg font-semibold text-red-600">{error}</p>
        <Link href="/directory" className="mt-6 inline-flex rounded-2xl bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800">
          Return to directory
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur">
        <div>
          <h1 className="text-3xl font-black text-slate-950">Book {sitter?.name}</h1>
          <p className="mt-2 text-sm text-slate-600">Complete the booking steps to request service from this sitter.</p>
        </div>
        <Link href={`/sitter/${sitter?.id}`} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100">
          <ArrowLeft className="h-4 w-4" /> Back to sitter
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <section className="space-y-6 rounded-[2rem] border border-slate-200/70 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-4 rounded-[1.5rem] bg-slate-50 p-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Step {step} of 3</p>
              <h2 className="text-xl font-extrabold text-slate-950">{stepTitle[step - 1]}</h2>
            </div>
            <div className="space-x-2 text-sm text-slate-500">
              {stepTitle.map((title, index) => (
                <span key={title} className={index + 1 === step ? "font-black text-slate-900" : "font-semibold text-slate-400"}>
                  {index + 1}
                </span>
              ))}
            </div>
          </div>

          {error && <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
          {success && createdBooking && (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-700">
              <p className="font-bold text-slate-900">Booking submitted successfully.</p>
              <p className="mt-2">Your request has been sent and the sitter team will review it shortly.</p>
              <div className="mt-4 rounded-3xl bg-white p-4 text-slate-900 shadow-sm">
                <p className="text-sm font-semibold">Booking reference: <span className="font-normal">{createdBooking.id}</span></p>
                <p className="text-sm">Sitter: {sitter?.name}</p>
                <p className="text-sm">Service: {createdBooking.serviceType}</p>
                <p className="text-sm">Date: {new Date(createdBooking.bookingDate).toLocaleDateString()}</p>
                <p className="text-sm">Address: {createdBooking.serviceAddress}</p>
                <p className="text-sm">Phone: {createdBooking.customerPhone}</p>
                <p className="text-sm">Pets: {petCount} {petType}</p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="customer-name" className="mb-2 block text-sm font-bold text-slate-900">Full Name</label>
                <input
                  id="customer-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label htmlFor="customer-email" className="mb-2 block text-sm font-bold text-slate-900">Email Address</label>
                <input
                  id="customer-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="jane@example.com"
                />
              </div>
              <div>
                <label htmlFor="customer-phone" className="mb-2 block text-sm font-bold text-slate-900">Phone Number</label>
                <input
                  id="customer-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label htmlFor="service-address" className="mb-2 block text-sm font-bold text-slate-900">Home/Service Address</label>
                <input
                  id="service-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="123 Main St, City, Zip"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="pet-type" className="mb-2 block text-sm font-bold text-slate-900">Pet Type</label>
                <select
                  id="pet-type"
                  value={petType}
                  onChange={(e) => setPetType(e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                >
                  {PET_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="pet-count" className="mb-2 block text-sm font-bold text-slate-900">Number of Pets</label>
                <input
                  id="pet-count"
                  type="number"
                  min={1}
                  max={sitter?.maxPetCount || 5}
                  value={petCount}
                  onChange={(e) => setPetCount(parseInt(e.target.value, 10) || 1)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                />
                <p className="mt-2 text-xs text-slate-500">This sitter can care for up to {sitter?.maxPetCount} pet(s) at once.</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="booking-date" className="mb-2 block text-sm font-bold text-slate-900">Booking Date</label>
                <input
                  id="booking-date"
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                />
              </div>
              <div>
                <label htmlFor="booking-notes" className="mb-2 block text-sm font-bold text-slate-900">Notes</label>
                <textarea
                  id="booking-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="Anything the sitter should know about your pet's routine, medication, or home instructions."
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={prevStep}
              disabled={step === 1 || submitting}
              className="inline-flex items-center justify-center rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Back
            </button>
            <div className="flex items-center gap-3">
              {step < 3 ? (
                <button
                  onClick={nextStep}
                  className="inline-flex items-center justify-center rounded-3xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || success}
                  className="inline-flex items-center justify-center rounded-3xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Booking"}
                </button>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-6 rounded-[2rem] border border-slate-200/70 bg-slate-950/95 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="rounded-3xl bg-slate-900/90 p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-amber-300">Booking summary</p>
            <h3 className="mt-3 text-xl font-black tracking-tight">{sitter?.name}</h3>
            <p className="mt-2 text-sm text-slate-300">{sitter?.bio || "Trusted sitter for your pet."}</p>
          </div>

          <div className="grid gap-4 rounded-3xl border border-slate-800/90 bg-slate-900/90 p-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Service</p>
              <p className="mt-2 text-base font-bold text-white">{sitter?.category || "Pet Sitting"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Hourly Rate</p>
              <p className="mt-2 text-base font-bold text-white">${sitter?.hourlyRate.toFixed(0)}/hr</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Max Pets</p>
              <p className="mt-2 text-base font-bold text-white">{sitter?.maxPetCount}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Selected Pets</p>
              <p className="mt-2 text-base font-bold text-white">{petCount} {petType}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Phone</p>
              <p className="mt-2 text-base font-bold text-white">{phone || "Not provided"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Date</p>
              <p className="mt-2 text-base font-bold text-white">{bookingDate || "Not selected"}</p>
            </div>
          </div>

          {success && (
            <div className="rounded-3xl border border-emerald-500/50 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                <p>Your request has been sent. We will contact you soon.</p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
