import { NextResponse } from "next/server";

import { getAdminSession, adminUnauthorized, formatDocuments } from "@/lib/api";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return adminUnauthorized();

  const db = await getDb();
  const inquiries = await db.collection("Inquiry").find({}).sort({ createdAt: -1 }).toArray();

  return NextResponse.json(formatDocuments(inquiries));
}
