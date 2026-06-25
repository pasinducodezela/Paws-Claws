"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, Facebook, X, Linkedin } from "lucide-react";

export function Footer() {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return null;
  }

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to subscribe");
      
      setStatus("success");
      setMessage(data.message || "Thanks for subscribing!");
      setEmail("");
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message);
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-200">
      <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-8 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr] lg:grid-cols-[2.2fr_1fr_1fr_1fr_1.4fr]">
          <div className="space-y-4">
            <div>
              <p className="text-2xl font-black text-white">Paws & Claws</p>
              <p className="mt-2 max-w-xl text-sm leading-7 text-slate-300">
                Trusted Pet Care & Verified Sitter Marketplace. Connecting pet owners with trusted, verified pet care professionals.
              </p>
            </div>
            <div className="space-y-2 text-sm text-slate-400">
              <p>Email: support@pawsclaws.com</p>
              <p>Phone: +94 77 123 4567</p>
              <p>Address: Colombo, Sri Lanka</p>
            </div>
            <div className="flex items-center gap-3 pt-3">
              <a href="#" aria-label="Instagram" className="transition hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Facebook" className="transition hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" aria-label="X" className="transition hover:text-white">
                <X className="h-5 w-5" />
              </a>
              <a href="#" aria-label="LinkedIn" className="transition hover:text-white">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.24em] text-amber-300">Quick Links</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>
                <Link href="/" className="transition hover:text-white">Home</Link>
              </li>
              <li>
                <Link href="/directory" className="transition hover:text-white">Find a Sitter</Link>
              </li>
              <li>
                <Link href="/booking" className="transition hover:text-white">Book a Service</Link>
              </li>
              <li>
                <Link href="/help" className="transition hover:text-white">Help & Support</Link>
              </li>
              <li>
                <Link href="/admin/login" className="transition hover:text-white">Admin Login</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.24em] text-amber-300">Services</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>Daily Dog Walking</li>
              <li>Overnight Pet Sitting</li>
              <li>Pet Grooming</li>
              <li>Vet Assistant Care</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.24em] text-amber-300">Support</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>
                <Link href="/help" className="transition hover:text-white">FAQ</Link>
              </li>
              <li>
                <Link href="/help" className="transition hover:text-white">Contact Us</Link>
              </li>
              <li>
                <Link href="#" className="transition hover:text-white">Report an Issue</Link>
              </li>
              <li>
                <Link href="#" className="transition hover:text-white">Terms & Conditions</Link>
              </li>
              <li>
                <Link href="#" className="transition hover:text-white">Privacy Policy</Link>
              </li>
            </ul>
          </div>

          <div className="rounded-[2rem] border border-slate-800/80 bg-slate-900/95 p-6 text-slate-300">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.24em] text-amber-300">Newsletter</h3>
            <p className="mb-4 text-sm leading-7 text-slate-400">
              Stay Updated with the latest sitter availability, offers, and pet care tips.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <label htmlFor="footer-newsletter" className="sr-only">
                Email address
              </label>
              <input
                id="footer-newsletter"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status !== "idle") setStatus("idle");
                }}
                placeholder="Enter email"
                required
                className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-3xl bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {status === "loading" ? "Subscribing..." : "Subscribe"}
              </button>
              
              {status === "success" && (
                <p className="text-xs font-semibold text-emerald-400 text-center mt-2">{message}</p>
              )}
              {status === "error" && (
                <p className="text-xs font-semibold text-red-400 text-center mt-2">{message}</p>
              )}
            </form>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800/80 bg-slate-900/90 px-6 py-4 text-center text-sm text-slate-500 sm:px-8 lg:px-10">
        <p>© 2026 Paws & Claws. All Rights Reserved. Designed & Developed by Pixzora Labs.</p>
      </div>
    </footer>
  );
}
