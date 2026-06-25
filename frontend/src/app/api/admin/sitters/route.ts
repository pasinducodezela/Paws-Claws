import { NextResponse } from "next/server";

import { getAdminSession, adminUnauthorized, formatDocument } from "@/lib/api";
import { getDb } from "@/lib/mongodb";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return adminUnauthorized();

  const data = await request.json();
  const { name, category, hourlyRate, availability, bio, profileImage, maxPetCount, experience, certifications } = data;

  if (!name || !category || typeof hourlyRate !== "number") {
    return NextResponse.json({ error: "Missing sitter information" }, { status: 400 });
  }

  const db = await getDb();
  const result = await db.collection("Sitter").insertOne({
    name: name.trim(),
    category: category.trim(),
    hourlyRate,
    availability: Boolean(availability),
    bio: bio?.trim() || null,
    profileImage: profileImage?.trim() || null,
    maxPetCount: Number(maxPetCount) || 3,
    experience: experience?.trim() || null,
    certifications: Array.isArray(certifications) ? certifications : [],
    rating: 5.0,
    availabilitySchedule: [],
    safety: null,
    insurance: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const sitter = await db.collection("Sitter").findOne({ _id: result.insertedId });
  return NextResponse.json({ success: true, sitter: formatDocument(sitter) });
}
