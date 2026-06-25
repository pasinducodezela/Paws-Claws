import Link from "next/link";
import { Star, ShieldCheck } from "lucide-react";

export interface Sitter {
  id: string;
  name: string;
  category: string;
  bio?: string | null;
  hourlyRate: number;
  availability: boolean;
  profileImage?: string | null;
  maxPetCount: number;
  rating: number;
  experience?: string | null;
  certifications: string[];
  safety?: string | null;
  insurance?: string | null;
}

interface SitterCardProps {
  sitter: Sitter;
}

export default function SitterCard({ sitter }: SitterCardProps) {
  // Fallback avatar if no profile image is available
  const avatarUrl = sitter.profileImage || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(sitter.name)}`;

  return (
    <Link href={`/sitter/${sitter.id}`} className="group flex flex-col overflow-hidden rounded-[2rem] border border-slate-200/60 bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-400/50 hover:shadow-[0_20px_50px_rgba(245,158,11,0.12)] cursor-pointer">
      {/* Profile Header Block */}
      <div className="relative p-6 pb-4">
        {/* Availability Badge */}
        <span
          className={`absolute top-6 right-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide ${
            sitter.availability
              ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
              : "bg-slate-100 text-slate-500 border border-slate-200"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${sitter.availability ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
          {sitter.availability ? "Available Now" : "Not Available"}
        </span>

        <div className="flex gap-4">
          {/* Avatar Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl}
            alt={sitter.name}
            className="h-16 w-16 rounded-2xl object-cover border-2 border-white shadow-md bg-amber-50/50"
          />

          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-md w-fit">{sitter.category}</span>
            <h3 className="text-lg font-extrabold text-slate-900 mt-1.5 tracking-tight group-hover:text-amber-500 transition-colors">{sitter.name}</h3>
            
            {/* Rating */}
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-slate-800">{sitter.rating.toFixed(1)}</span>
              <span className="text-slate-300 text-xs">|</span>
              <span className="text-[11px] text-slate-500 font-semibold">{sitter.experience || "Experience verified"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sitter Bio / Quick Info */}
      <div className="px-6 flex-1">
        <p className="text-sm leading-relaxed text-slate-600 line-clamp-2 font-medium">
          {sitter.bio || "Professional pet care services customized to your pet's needs."}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100/80 py-3 text-xs text-slate-600">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Max Pets Limit</span>
            <span className="font-bold text-slate-800 mt-0.5">{sitter.maxPetCount} at a time</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Verified Safety</span>
            <span className="font-bold text-slate-800 mt-0.5 inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-500 fill-amber-50" /> Secure
            </span>
          </div>
        </div>
      </div>

      {/* Pricing & Booking Action */}
      <div className="bg-slate-50/40 p-6 pt-4 border-t border-slate-100/80 flex items-center justify-between gap-4 mt-auto">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Rate</span>
          <span className="text-lg font-black text-slate-950">
            ${sitter.hourlyRate}<span className="text-xs text-slate-500 font-medium">/hr</span>
          </span>
        </div>

        <div
          className="flex-1 text-center font-bold text-sm bg-slate-950 group-hover:bg-amber-500 group-hover:text-slate-950 text-white py-3 px-4 rounded-2xl shadow-sm transition-all duration-200 btn-animate"
        >
          View Profile
        </div>
      </div>
    </Link>
  );
}
