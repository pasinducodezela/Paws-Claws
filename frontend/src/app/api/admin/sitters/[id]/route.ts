import { NextResponse } from "next/server";

import { getAdminSession, adminUnauthorized, formatDocument } from "@/lib/api";
import { getDb } from "@/lib/mongodb";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return adminUnauthorized();

  const { id } = await context.params;
  const data = await request.json();
  const { name, category, hourlyRate, availability, bio, profileImage, maxPetCount, experience, certifications, availabilitySchedule } = data;

  if (!name || !category || typeof hourlyRate !== "number") {
    return NextResponse.json({ error: "Missing sitter information" }, { status: 400 });
  }

  const db = await getDb();
  const sitter = await db.collection("Sitter").findOneAndUpdate(
    { _id: new (await import("mongodb")).ObjectId(id) },
    {
      $set: {
        name: name.trim(),
        category: category.trim(),
        hourlyRate,
        availability: Boolean(availability),
        bio: bio?.trim() || null,
        profileImage: profileImage?.trim() || null,
        maxPetCount: Number(maxPetCount) || 3,
        experience: experience?.trim() || null,
        certifications: Array.isArray(certifications) ? certifications : [],
        availabilitySchedule: Array.isArray(availabilitySchedule) ? availabilitySchedule : [],
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );
  if (!sitter) {
    return NextResponse.json({ error: "Sitter not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, sitter: formatDocument(sitter) });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return adminUnauthorized();

  const { id } = await context.params;
  const db = await getDb();
  const result = await db.collection("Sitter").deleteOne({ _id: new (await import("mongodb")).ObjectId(id) });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Sitter not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
