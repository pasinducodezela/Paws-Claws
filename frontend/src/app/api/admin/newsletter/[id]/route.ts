import { NextResponse } from "next/server";
import { getAdminSession, adminUnauthorized } from "@/lib/api";
import { getDb } from "@/lib/mongodb";

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return adminUnauthorized();

  const { id } = await context.params;
  const db = await getDb();
  const { ObjectId } = await import("mongodb");
  
  const result = await db.collection("Subscriber").deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
