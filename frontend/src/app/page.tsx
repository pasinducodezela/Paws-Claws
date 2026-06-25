import Link from "next/link";
import { Footprints, Moon, Scissors, HeartPulse, ArrowRight } from "lucide-react";
import { HomeSearchHero } from "@/components/HomeSearchHero";
import FeaturedSittersClient from "@/components/FeaturedSittersClient";
import { PlayfulCat } from "@/components/PlayfulCat";

const services = [
  {
    title: "Daily Dog Walking",
    description: "Keep your dog active and happy with scheduled neighborhood walks and play breaks.",
    icon: Footprints,
    category: "Dog Walker",
  },
  {
    title: "Overnight House Sitting",
    description: "Provide peace of mind with dedicated, overnight pet care in the comfort of your home.",
    icon: Moon,
    category: "House Sitter",
  },
  {
    title: "Professional Pet Grooming",
    description: "Professional bathing, brush outs, nail trimming, and haircuts tailored to your pet's needs.",
    icon: Scissors,
    category: "Groomer",
  },
  {
    title: "Medical Vet Assistant Care",
    description: "Expert care for special needs, senior pets, and post-surgery rehabilitation.",
    icon: HeartPulse,
    category: "Vet Assistant",
  },
];

export const dynamic = "force-dynamic";

export default function Home() {

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
      <PlayfulCat />
      
      {/* Hero Section */}
      <HomeSearchHero />

      {/* Core Zone Highlights Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Core Zone Highlights
            </h2>
            <p className="mt-1 text-slate-500 text-sm md:text-base">
              Explore our main service zones and find the right care for your pet.
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 hover:text-amber-600 transition"
          >
            Explore all services <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const Icon = service.icon;
            const colorMap: Record<string, { bg: string; icon: string; border: string; hover: string }> = {
              "Daily Dog Walking": { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-200", hover: "hover:border-emerald-400 hover:bg-emerald-100/50" },
              "Overnight House Sitting": { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-200", hover: "hover:border-blue-400 hover:bg-blue-100/50" },
              "Professional Pet Grooming": { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-200", hover: "hover:border-purple-400 hover:bg-purple-100/50" },
              "Medical Vet Assistant Care": { bg: "bg-rose-50", icon: "text-rose-600", border: "border-rose-200", hover: "hover:border-rose-400 hover:bg-rose-100/50" },
            };
            const colors = colorMap[service.title] || { bg: "bg-slate-50", icon: "text-slate-600", border: "border-slate-200", hover: "hover:border-slate-400" };
            
            return (
              <Link
                key={service.title}
                href={`/directory?category=${encodeURIComponent(service.category)}`}
                className={`group rounded-[2rem] border-2 ${colors.border} ${colors.bg} p-7 shadow-sm transition-all duration-300 ${colors.hover} hover:shadow-lg flex flex-col justify-between min-h-[200px]`}
              >
                <div>
                  <div className={`mb-5 inline-flex rounded-2xl ${colors.bg} p-4 ${colors.icon} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className={`text-lg font-bold text-slate-950 group-hover:${colors.icon} transition`}>
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 font-medium">
                    {service.description}
                  </p>
                </div>
                <div className={`mt-4 inline-flex items-center gap-2 text-xs font-bold ${colors.icon} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                  Learn more <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Sitters Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Featured Sitters
            </h2>
            <p className="mt-1 text-slate-500 text-sm md:text-base">
              Highly-rated local caretakers ready to help you.
            </p>
          </div>
          <Link
            href="/directory"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 hover:text-amber-600 transition"
          >
            View all sitters <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <FeaturedSittersClient />
      </section>
    </main>
  );
}
