"use client";

import { useState, type FormEvent } from "react";
import { AlertTriangle } from "lucide-react";

const INQUIRY_TYPES = ["Sitter No-Show", "Incident Report", "Medication Dispute", "General Inquiry"];

export default function HelpInquiryClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(INQUIRY_TYPES[0]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill all required fields before sending your inquiry.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to submit inquiry.");
      }
      setSuccess(true);
      setName("");
      setEmail("");
      setMessage("");
      setSubject(INQUIRY_TYPES[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit inquiry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="space-y-8 rounded-[2rem] border border-slate-200/70 bg-white/90 p-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <div>
          <h1 className="text-3xl font-black text-slate-950">Need help?</h1>
          <p className="mt-3 text-sm text-slate-600">Use the form below to send an inquiry, report a sitter incident, or ask for fast support.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-[1.75rem] border border-slate-200/70 bg-slate-50 p-6 shadow-sm">
            {error && (
              <div className="flex items-center gap-2 rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                Your inquiry was submitted. A team member will get back to you soon.
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-slate-700">
                Your Name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="Jane Doe"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-slate-700">
                Email Address
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="jane@example.com"
                />
              </label>
            </div>

            <div className="space-y-2 text-sm font-semibold text-slate-700">
              <label htmlFor="inquiry-type">Inquiry Type</label>
              <select
                id="inquiry-type"
                title="Select inquiry type"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              >
                {INQUIRY_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 text-sm font-semibold text-slate-700">
              <label htmlFor="inquiry-message">Message</label>
              <textarea
                id="inquiry-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                placeholder="Describe your concern or request..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-3xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Sending..." : "Submit Inquiry"}
            </button>
          </form>

          <div className="rounded-[1.75rem] border border-slate-200/70 bg-slate-950/95 p-6 text-white shadow-sm">
            <h2 className="text-xl font-black">Need assistance?</h2>
            <p className="mt-3 text-sm text-slate-300">Choose the right option for help and include as much detail as possible.</p>
            <ul className="mt-6 space-y-4 text-sm">
              <li className="rounded-3xl bg-slate-900/80 px-4 py-4">
                <strong className="block font-bold">Sitter No-Show</strong>
                Report a sitter who did not arrive as scheduled.
              </li>
              <li className="rounded-3xl bg-slate-900/80 px-4 py-4">
                <strong className="block font-bold">Incident Report</strong>
                Report issues during a sitting service.
              </li>
              <li className="rounded-3xl bg-slate-900/80 px-4 py-4">
                <strong className="block font-bold">Medication Dispute</strong>
                Get support for medication or treatment concerns.
              </li>
              <li className="rounded-3xl bg-slate-900/80 px-4 py-4">
                <strong className="block font-bold">General Inquiry</strong>
                Ask about bookings, payments, or policies.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
