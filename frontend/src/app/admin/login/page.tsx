"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/admin/dashboard",
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError("Invalid admin credentials.");
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-6 py-16 sm:px-10 lg:px-12">
      <section className="w-full max-w-md rounded-[2rem] border border-white/60 bg-white/80 p-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-amber-600">Admin Access</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Sign In</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">Access the Paws &amp; Claws admin dashboard.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              placeholder="admin@pawsclaws.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              placeholder="Your admin password"
            />
          </div>

          {error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-extrabold text-white shadow-md transition hover:bg-amber-500 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-70 btn-animate"
          >
            {isSubmitting ? "Signing in..." : "Sign In to Dashboard"}
          </button>
        </form>
      </section>
    </main>
  );
}