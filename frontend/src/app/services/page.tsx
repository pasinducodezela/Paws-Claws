import { ArrowRight } from "lucide-react";
import Link from "next/link";

const services = [
  {
    title: "Daily Dog Walking",
    description: "Keep your dog active and happy with scheduled neighborhood walks and play breaks.",
  },
  {
    title: "Overnight House Sitting",
    description: "Peace of mind with dedicated, overnight pet care in the comfort of your home.",
  },
  {
    title: "Professional Pet Grooming",
    description: "Professional bathing, brush outs, nail trimming, and haircuts tailored to your pet's needs.",
  },
  {
    title: "Medical Vet Assistant Care",
    description: "Expert care for special needs, senior pets, and post-surgery rehabilitation.",
  },
];

export default function ServicesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      <section className="space-y-6">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-500">Services</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            The care your pet deserves.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Browse our full service offerings and choose the perfect package for your pet’s needs.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {services.map((service) => (
            <div key={service.title} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm transition hover:border-slate-300 hover:shadow-lg">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">{service.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{service.description}</p>
                </div>
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <Link href="/directory" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950 hover:text-amber-600 transition">
            Find sitters for your service <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
