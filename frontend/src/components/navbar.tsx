"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PawPrint, ShieldCheck } from "lucide-react";
import { useSession } from "next-auth/react";

import { navLinks } from "@/utils/navigation";

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return null;
  }

  // Build display links: hide public links while inside admin
  let displayLinks = [...navLinks];

  if (session) {
    displayLinks.push({ href: "/admin/dashboard", label: "Dashboard" });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4 sm:px-10 lg:px-12">
        <Link href="/" className="flex items-center gap-3 text-sm font-extrabold tracking-tight text-slate-950">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15">
            <PawPrint className="h-5 w-5" />
          </span>
          Paws &amp; Claws
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {displayLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            const isDashboard = link.href === "/admin/dashboard";
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-full transition-all duration-200 ${
                  isActive
                    ? "bg-slate-950 text-white shadow-md shadow-slate-950/10 scale-105"
                    : isDashboard
                    ? "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/50"
                }`}
              >
                {isDashboard && <ShieldCheck className="h-3.5 w-3.5" />}
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}