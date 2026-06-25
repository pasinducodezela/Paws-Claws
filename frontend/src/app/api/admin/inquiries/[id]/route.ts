import { NextResponse } from "next/server";

import { getAdminSession, adminUnauthorized } from "@/lib/api";
import { getDb } from "@/lib/mongodb";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return adminUnauthorized();

  const { status } = await request.json();
  const { id } = await context.params;
  if (!status) {
    return NextResponse.json({ error: "Status is required" }, { status: 400 });
  }

  const db = await getDb();
  const inquiry = await db.collection("Inquiry").findOneAndUpdate(
    { _id: new (await import("mongodb")).ObjectId(id) },
    { $set: { status, updatedAt: new Date() } },
    { returnDocument: "after" }
  );

  if (!inquiry) {
    return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, inquiry });
}
