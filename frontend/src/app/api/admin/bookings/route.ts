import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { getAdminSession, adminUnauthorized, formatDocuments } from "@/lib/api";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return adminUnauthorized();

  const db = await getDb();
  const [bookings, sitters] = await Promise.all([
    db.collection("Booking").find({}).sort({ createdAt: -1 }).toArray(),
    db.collection("Sitter").find({}).toArray(),
  ]);

  const sitterMap = new Map(sitters.map((sitter) => [sitter._id.toString(), sitter]));

  const enriched = bookings.map((booking) => {
    const formatted = formatDocuments([booking])[0];
    const sitter = booking.sitterId ? sitterMap.get(booking.sitterId.toString()) : null;
    return {
      ...formatted,
      sitter: sitter ? formatDocuments([sitter])[0] : null,
    };
  });

  return NextResponse.json(enriched);
}
