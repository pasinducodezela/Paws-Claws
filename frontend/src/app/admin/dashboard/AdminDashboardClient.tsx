"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Users, CalendarCheck, PlusCircle, Pencil, Trash2,
  CheckCircle2, XCircle, Clock, AlertCircle, BarChart2,
  ShieldCheck, LogOut, X, Save, Loader2, Truck, Mail
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Sitter } from "@/components/SitterCard";

const CATEGORIES = ["Dog Walker", "House Sitter", "Groomer", "Vet Assistant"];

interface Booking {
  id: string;
  sitterId?: string;
  sitter?: Sitter | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceType: string;
  petType?: string | null;
  bookingDate: string;
  petCount: number;
  hours: number;
  status: string;
  notes?: string;
  createdAt: string;
}

interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

interface Subscriber {
  _id: string;
  email: string;
  status: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  UNDER_REVIEW: "bg-violet-50 text-violet-700 border-violet-200",
  DISPATCHED: "bg-blue-50 text-blue-700 border-blue-200",
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
  COMPLETED: "bg-slate-50 text-slate-700 border-slate-200",
};

const emptyForm = {
  name: "",
  category: "Dog Walker",
  hourlyRate: "",
  availability: true,
  bio: "",
  profileImage: "",
  maxPetCount: "3",
  experience: "",
  certifications: "",
};

export default function AdminDashboardClient() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tab, setTab] = useState<"overview" | "sitters" | "bookings" | "inquiries" | "subscribers">("overview");

  // Sitters state
  const [sitters, setSitters] = useState<Sitter[]>([]);
  const [sittersLoading, setSittersLoading] = useState(true);

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  // Inquiry state
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(true);

  // Subscribers state
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subscribersLoading, setSubscribersLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingSitter, setEditingSitter] = useState<Sitter | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Broadcast state
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // Auth guard
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  const fetchSitters = async () => {
    setSittersLoading(true);
    try {
      const res = await fetch(`/api/sitters`, { cache: "no-store" });
      const data = await res.json();
      setSitters(data);
    } catch {
      console.error("Failed to fetch sitters");
    } finally {
      setSittersLoading(false);
    }
  };

  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings`, { cache: "no-store" });
      const data = await res.json();
      setBookings(data);
    } catch {
      console.error("Failed to fetch bookings");
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchInquiries = async () => {
    setInquiriesLoading(true);
    try {
      const res = await fetch(`/api/admin/inquiries`, { cache: "no-store" });
      const data = await res.json();
      setInquiries(data);
    } catch {
      console.error("Failed to fetch inquiries");
    } finally {
      setInquiriesLoading(false);
    }
  };

  const fetchSubscribers = async () => {
    setSubscribersLoading(true);
    try {
      const res = await fetch(`/api/admin/newsletter`, { cache: "no-store" });
      const data = await res.json();
      setSubscribers(data);
    } catch {
      console.error("Failed to fetch subscribers");
    } finally {
      setSubscribersLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      Promise.resolve().then(() => {
        void Promise.all([fetchSitters(), fetchBookings(), fetchInquiries(), fetchSubscribers()]);
      });
    }
  }, [status]);

  // Open modal to create sitter
  const openCreate = () => {
    setEditingSitter(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  // Open modal to edit sitter
  const openEdit = (sitter: Sitter) => {
    setEditingSitter(sitter);
    setForm({
      name: sitter.name,
      category: sitter.category,
      hourlyRate: String(sitter.hourlyRate),
      availability: sitter.availability,
      bio: sitter.bio || "",
      profileImage: sitter.profileImage || "",
      maxPetCount: String(sitter.maxPetCount),
      experience: sitter.experience || "",
      certifications: sitter.certifications.join(", "),
    });
    setShowModal(true);
  };

  // Save sitter
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        hourlyRate: parseFloat(form.hourlyRate) || 0,
        maxPetCount: parseInt(form.maxPetCount, 10) || 3,
        certifications: form.certifications.split(",").map((s) => s.trim()).filter(Boolean),
      };

      const url = editingSitter
        ? `/api/admin/sitters/${editingSitter.id}`
        : `/api/admin/sitters`;
      const method = editingSitter ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save");
      setShowModal(false);
      await fetchSitters();
    } catch (e) {
      console.error("Save failed", e);
    } finally {
      setSaving(false);
    }
  };

  // Delete sitter
  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/sitters/${id}`, { method: "DELETE" });
      setDeleteConfirm(null);
      await fetchSitters();
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  const updateBookingStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Update failed:", errorData);
        alert(`Failed to update booking: ${errorData.error || res.statusText}`);
        return;
      }
      
      await fetchBookings();
    } catch (e) {
      console.error("Update failed", e);
      alert("Failed to update booking due to network error.");
    }
  };

  const updateInquiryStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchInquiries();
    } catch (e) {
      console.error("Inquiry status update failed", e);
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastSubject || !broadcastMessage) return;
    setSendingBroadcast(true);
    try {
      const res = await fetch("/api/admin/newsletter/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: broadcastSubject, message: broadcastMessage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send broadcast");
      alert(`Successfully sent broadcast to ${data.count} subscribers!`);
      setShowBroadcastModal(false);
      setBroadcastSubject("");
      setBroadcastMessage("");
    } catch (e: any) {
      console.error("Broadcast failed:", e);
      alert(e.message || "Failed to send broadcast");
    } finally {
      setSendingBroadcast(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;
  const activeServices = bookings.filter((b) => ["UNDER_REVIEW", "DISPATCHED", "CONFIRMED"].includes(b.status)).length;
  const openInquiries = inquiries.filter((i) => i.status === "OPEN").length;

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      {/* Admin Navbar */}
      <header className="sticky top-0 z-40 border-b border-white/40 bg-white/70 backdrop-blur-xl mb-8 -mx-4 px-4 py-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-amber-500" />
              <h1 className="text-xl font-black tracking-tight text-slate-950 hidden md:block">Admin</h1>
            </div>

            {/* Nav Links */}
            <nav className="flex flex-wrap gap-1.5 rounded-2xl border border-slate-200 bg-slate-50/80 p-1.5">
              {[
                { key: "overview", label: "Overview", icon: BarChart2 },
                { key: "sitters", label: "Sitters", icon: Users },
                { key: "bookings", label: "Bookings", icon: CalendarCheck },
                { key: "inquiries", label: "Inquiries", icon: AlertCircle },
                { key: "subscribers", label: "Subscribers", icon: Mail },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key as typeof tab)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 ${
                    tab === key
                      ? "bg-slate-950 text-white shadow-md scale-[1.02]"
                      : "text-slate-500 hover:text-slate-900 hover:bg-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-4">
            <p className="text-sm font-medium text-slate-500 hidden sm:block">
              <span className="font-bold text-slate-700">{session?.user?.email}</span>
            </p>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── OVERVIEW TAB ─── */}
      {tab === "overview" && (
        <div className="space-y-8">
          {/* Stats */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Sitters", value: sitters.length, icon: Users, style: "bg-amber-100/80 text-amber-600" },
              { label: "Pending Bookings", value: pendingBookings, icon: Clock, style: "bg-orange-100/80 text-orange-600" },
              { label: "Open Inquiries", value: openInquiries, icon: AlertCircle, style: "bg-emerald-100/80 text-emerald-600" },
              { label: "Subscribers", value: subscribers.length, icon: Mail, style: "bg-pink-100/80 text-pink-600" },
            ].map(({ label, value, icon: Icon, style }) => (
              <div
                key={label}
                className="rounded-[1.75rem] border border-slate-200/60 bg-white/80 p-6 shadow-[0_4px_20px_rgb(0,0,0,0.04)] backdrop-blur-md"
              >
                <div className={`${style} mb-4 inline-flex rounded-2xl p-3`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-3xl font-black text-slate-950">{value}</div>
                <div className="mt-1 text-sm font-semibold text-slate-500">{label}</div>
              </div>
            ))}
          </div>

          {/* Recent Bookings */}
          <div className="rounded-[1.75rem] border border-slate-200/60 bg-white/80 p-6 shadow-[0_4px_20px_rgb(0,0,0,0.04)] backdrop-blur-md">
            <h2 className="mb-5 text-lg font-extrabold text-slate-900">Recent Bookings</h2>
            {bookingsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
              </div>
            ) : bookings.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400 font-medium">No bookings yet.</p>
            ) : (
              <div className="space-y-3">
                {bookings.slice(0, 5).map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{b.customerName}</p>
                      <p className="text-xs font-medium text-slate-500">{b.serviceType} • {b.sitter?.name ?? "Unassigned"}</p>
                    </div>
                    <span className={`w-fit rounded-full border px-3 py-1 text-[11px] font-bold ${STATUS_COLORS[b.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── SITTERS TAB ─── */}
      {tab === "sitters" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900">Manage Sitters ({sitters.length})</h2>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-amber-500 hover:text-slate-950 btn-animate"
            >
              <PlusCircle className="h-4 w-4" /> Add Sitter
            </button>
          </div>

          {sittersLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-[1.75rem] border border-slate-200/60 bg-white/80 shadow-[0_4px_20px_rgb(0,0,0,0.04)] backdrop-blur-md">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500">Name</th>
                    <th className="px-4 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500 hidden sm:table-cell">Category</th>
                    <th className="px-4 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500 hidden md:table-cell">Rate</th>
                    <th className="px-4 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-extrabold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sitters.map((s) => (
                    <tr key={s.id} className="transition hover:bg-slate-50/60">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={s.profileImage || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(s.name)}`}
                            alt={s.name}
                            className="h-10 w-10 rounded-xl object-cover border border-slate-100"
                          />
                          <span className="font-bold text-slate-900">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">{s.category}</span>
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-900 hidden md:table-cell">${s.hourlyRate}/hr</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${s.availability ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${s.availability ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                          {s.availability ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(s)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          {deleteConfirm === s.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(s.id)}
                                className="rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700"
                              >Confirm</button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
                              >Cancel</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(s.id)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── BOOKINGS TAB ─── */}
      {tab === "bookings" && (
        <div className="space-y-5">
          <h2 className="text-xl font-extrabold text-slate-900">Manage Bookings ({bookings.length})</h2>

          {bookingsLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[1.75rem] border-2 border-dashed border-slate-200 bg-white/50 p-16 text-center">
              <CalendarCheck className="h-10 w-10 text-slate-300" />
              <p className="mt-3 text-base font-bold text-slate-500">No bookings yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-[1.75rem] border border-slate-200/60 bg-white/80 shadow-[0_4px_20px_rgb(0,0,0,0.04)] backdrop-blur-md">
              <table className="w-full text-sm min-w-[1200px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500">Booking ID</th>
                    <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500">Client</th>
                    <th className="px-4 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500 hidden sm:table-cell">Phone</th>
                    <th className="px-4 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500 hidden md:table-cell">Service</th>
                    <th className="px-4 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500 hidden lg:table-cell">Pet Type</th>
                    <th className="px-4 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500 hidden lg:table-cell">Pets</th>
                    <th className="px-4 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500 hidden xl:table-cell">Hours</th>
                    <th className="px-4 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500 hidden xl:table-cell">Address</th>
                    <th className="px-4 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500 hidden sm:table-cell">Sitter</th>
                    <th className="px-4 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500 hidden md:table-cell">Date</th>
                    <th className="px-4 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-extrabold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((b) => (
                    <tr key={b.id} className="transition hover:bg-slate-50/60">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{b.id.slice(0, 8)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{b.customerName}</p>
                        <p className="text-xs text-slate-500 font-medium">{b.customerEmail}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-600 hidden sm:table-cell">{b.customerPhone || "—"}</td>
                      <td className="px-4 py-4 font-semibold text-slate-900 hidden md:table-cell">{b.serviceType}</td>
                      <td className="px-4 py-4 text-slate-600 hidden lg:table-cell">{b.petType || "—"}</td>
                      <td className="px-4 py-4 font-semibold text-slate-900 hidden lg:table-cell">{b.petCount}</td>
                      <td className="px-4 py-4 font-semibold text-slate-900 hidden xl:table-cell">{b.hours}</td>
                      <td className="px-4 py-4 text-slate-600 hidden xl:table-cell max-w-[200px] truncate" title={b.serviceAddress || "—"}>{b.serviceAddress || "—"}</td>
                      <td className="px-4 py-4 font-semibold text-slate-700 hidden sm:table-cell">
                        {b.sitter?.name ?? <span className="text-slate-400 italic">Unassigned</span>}
                      </td>
                      <td className="px-4 py-4 text-slate-600 font-medium hidden md:table-cell">{new Date(b.bookingDate).toLocaleDateString()}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <select
                          value={b.status}
                          onChange={(e) => updateBookingStatus(b.id, e.target.value)}
                          className={`inline-block rounded-full border px-3 pr-8 py-1.5 text-[11px] font-bold cursor-pointer outline-none hover:shadow-sm transition w-full min-w-[130px] ${STATUS_COLORS[b.status] ?? "bg-slate-100 text-slate-600"}`}
                        >
                          <option className="bg-white text-slate-900 font-medium" value="PENDING">PENDING</option>
                          <option className="bg-white text-slate-900 font-medium" value="UNDER_REVIEW">UNDER REVIEW</option>
                          <option className="bg-white text-slate-900 font-medium" value="CONFIRMED">CONFIRMED</option>
                          <option className="bg-white text-slate-900 font-medium" value="DISPATCHED">DISPATCHED</option>
                          <option className="bg-white text-slate-900 font-medium" value="COMPLETED">COMPLETED</option>
                          <option className="bg-white text-slate-900 font-medium" value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          <button
                            onClick={() => updateBookingStatus(b.id, "CANCELLED")}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "inquiries" && (
        <div className="space-y-5">
          <h2 className="text-xl font-extrabold text-slate-900">Inquiry Mailbox ({inquiries.length})</h2>

          {inquiriesLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          ) : inquiries.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[1.75rem] border-2 border-dashed border-slate-200 bg-white/50 p-16 text-center">
              <AlertCircle className="h-10 w-10 text-slate-300" />
              <p className="mt-3 text-base font-bold text-slate-500">No inquiries yet</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/60 bg-white/80 shadow-[0_4px_20px_rgb(0,0,0,0.04)] backdrop-blur-md">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500">Name</th>
                    <th className="px-4 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500 hidden sm:table-cell">Email</th>
                    <th className="px-4 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500 hidden md:table-cell">Type</th>
                    <th className="px-4 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500">Message</th>
                    <th className="px-4 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500 hidden lg:table-cell">Date</th>
                    <th className="px-6 py-4 text-right text-xs font-extrabold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="transition hover:bg-slate-50/60">
                      <td className="px-6 py-4 font-bold text-slate-900">{inquiry.name}</td>
                      <td className="px-4 py-4 hidden sm:table-cell text-slate-600">{inquiry.email}</td>
                      <td className="px-4 py-4 hidden md:table-cell text-slate-700">{inquiry.subject}</td>
                      <td className="px-4 py-4 text-slate-600 line-clamp-2">{inquiry.message}</td>
                      <td className="px-4 py-4 hidden lg:table-cell text-slate-600">{new Date(inquiry.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          {inquiry.status === "OPEN" && (
                            <>
                              <button
                                onClick={() => updateInquiryStatus(inquiry.id, "RESOLVED")}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700"
                              >
                                Resolve
                              </button>
                              <button
                                onClick={() => updateInquiryStatus(inquiry.id, "ARCHIVED")}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                              >
                                Archive
                              </button>
                            </>
                          )}
                          {inquiry.status !== "OPEN" && (
                            <span className="text-xs font-semibold text-slate-400 italic">{inquiry.status}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── SUBSCRIBERS TAB ─── */}
      {tab === "subscribers" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900">Newsletter Subscribers ({subscribers.length})</h2>
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-amber-500 hover:text-slate-950 btn-animate"
            >
              <Mail className="h-4 w-4" /> Send Broadcast
            </button>
          </div>

          {subscribersLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          ) : subscribers.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[1.75rem] border-2 border-dashed border-slate-200 bg-white/50 p-16 text-center">
              <Mail className="h-10 w-10 text-slate-300" />
              <p className="mt-3 text-base font-bold text-slate-500">No subscribers yet</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/60 bg-white/80 shadow-[0_4px_20px_rgb(0,0,0,0.04)] backdrop-blur-md">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500">Email Address</th>
                    <th className="px-4 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500 hidden sm:table-cell">Status</th>
                    <th className="px-4 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500 hidden md:table-cell">Subscribed On</th>
                    <th className="px-6 py-4 text-right text-xs font-extrabold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subscribers.map((sub) => (
                    <tr key={sub._id || sub.email} className="transition hover:bg-slate-50/60">
                      <td className="px-6 py-4 font-bold text-slate-900">{sub.email}</td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">{sub.status || "SUBSCRIBED"}</span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell text-slate-600">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={async () => {
                            if (!confirm("Are you sure you want to remove this subscriber?")) return;
                            try {
                              await fetch(`/api/admin/newsletter/${sub._id}`, { method: "DELETE" });
                              await fetchSubscribers();
                            } catch (e) {
                              console.error("Delete failed", e);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── SITTER MODAL ─── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[2rem] border border-white/60 bg-white p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-slate-900">
                {editingSitter ? "Edit Sitter" : "Add New Sitter"}
              </h3>
              <button onClick={() => setShowModal(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                    placeholder="Sarah Wilson"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-amber-400"
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Hourly Rate ($) *</label>
                  <input
                    type="number"
                    value={form.hourlyRate}
                    onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                    placeholder="20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Max Pet Count</label>
                  <input
                    type="number"
                    value={form.maxPetCount}
                    onChange={(e) => setForm({ ...form, maxPetCount: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                    placeholder="3"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-3 select-none">
                    <input
                      type="checkbox"
                      checked={form.availability}
                      onChange={(e) => setForm({ ...form, availability: e.target.checked })}
                      className="peer sr-only"
                    />
                    <div className="relative h-6 w-11 rounded-full bg-slate-200 transition-colors peer-checked:bg-amber-500">
                      <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                    </div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Available</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Experience</label>
                <input
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="5 years experience"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none"
                  placeholder="Short description of services..."
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Certifications (comma separated)</label>
                <input
                  value={form.certifications}
                  onChange={(e) => setForm({ ...form, certifications: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="Pet First Aid, CPPS"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Profile Image</label>
                <input
                  type="file"
                  accept="image/jpeg, image/jpg, image/png"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    const formData = new FormData();
                    formData.append("file", file);
                    
                    try {
                      setUploadingImage(true);
                      const res = await fetch("/api/upload", {
                        method: "POST",
                        body: formData,
                      });
                      const data = await res.json();
                      if (data.success) {
                        setForm({ ...form, profileImage: data.url });
                      } else {
                        alert(data.error || "Upload failed");
                      }
                    } catch (err) {
                      console.error("Upload error", err);
                      alert("Failed to upload image");
                    } finally {
                      setUploadingImage(false);
                    }
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                />
                {uploadingImage && <p className="mt-2 text-xs text-amber-600 font-medium">Uploading image...</p>}
                {form.profileImage && !uploadingImage && (
                  <div className="mt-3">
                    <img src={form.profileImage} alt="Profile preview" className="h-16 w-16 rounded-xl object-cover border border-slate-200" />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploadingImage || !form.name || !form.hourlyRate}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-amber-500 hover:text-slate-950 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving..." : editingSitter ? "Save Changes" : "Create Sitter"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── BROADCAST MODAL ─── */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[2rem] border border-white/60 bg-white p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-slate-900">
                Send Newsletter Broadcast
              </h3>
              <button onClick={() => setShowBroadcastModal(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Email Subject *</label>
                <input
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="Monthly Updates from Paws & Claws!"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Message *</label>
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  rows={6}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-y"
                  placeholder="Hello subscribers! We have some exciting news..."
                />
                <p className="mt-2 text-xs text-slate-500 font-medium">This email will be sent via BCC to all {subscribers.length} active subscribers.</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSendBroadcast}
                disabled={sendingBroadcast || !broadcastSubject || !broadcastMessage || subscribers.length === 0}
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-6 py-2.5 text-sm font-bold text-slate-950 shadow-md transition hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {sendingBroadcast ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                {sendingBroadcast ? "Sending..." : "Send Broadcast"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
