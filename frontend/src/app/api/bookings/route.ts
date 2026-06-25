import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { getDb } from "@/lib/mongodb";
import { formatDocument } from "@/lib/api";

export async function POST(request: Request) {
  const body = await request.json();
  const {
    sitterId,
    customerName,
    customerEmail,
    customerPhone,
    serviceAddress,
    serviceType,
    petType,
    bookingDate,
    petCount = 1,
    hours = 4,
    notes,
    status = "UNDER_REVIEW",
  } = body;

  if (!sitterId) {
    return NextResponse.json({ error: "Sitter ID is required" }, { status: 400 });
  }

  const db = await getDb();

  let sitter;
  try {
    sitter = await db.collection("Sitter").findOne({ _id: new ObjectId(sitterId) });
  } catch {
    return NextResponse.json({ error: "Invalid sitter ID" }, { status: 400 });
  }

  if (!sitter) {
    return NextResponse.json({ error: "Sitter not found" }, { status: 404 });
  }

  if (!Number.isInteger(petCount) || petCount < 1) {
    return NextResponse.json({ error: "Pet count must be at least 1" }, { status: 400 });
  }

  if (petCount > sitter.maxPetCount) {
    return NextResponse.json({ error: "Exceeds sitter capacity" }, { status: 400 });
  }

  if (!Number.isInteger(hours) || hours < 1) {
    return NextResponse.json({ error: "Booking hours must be at least 1" }, { status: 400 });
  }

  const requestedDate = new Date(bookingDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(requestedDate.getTime()) || requestedDate <= today) {
    return NextResponse.json({ error: "Future date required" }, { status: 400 });
  }

  if (sitter.availability === false) {
    return NextResponse.json({ error: "This sitter is currently unavailable" }, { status: 400 });
  }

  const requestedDateKey = requestedDate.toISOString().split("T")[0];
  const schedule = Array.isArray(sitter.availabilitySchedule) ? sitter.availabilitySchedule : [];
  if (schedule.includes(requestedDateKey)) {
    return NextResponse.json(
      { error: "Selected date is blocked in the sitter's calendar" },
      { status: 400 }
    );
  }

  const bookingData = {
    sitterId: new ObjectId(sitterId),
    customerName: customerName?.trim() || "Guest",
    customerEmail: customerEmail?.trim() || "guest@example.com",
    customerPhone: customerPhone?.trim() || null,
    serviceAddress: serviceAddress?.trim() || "No Address Provided",
    serviceType: serviceType?.trim() || "Pet Sitting",
    petType: petType?.trim() || null,
    bookingDate: requestedDate,
    petCount,
    hours,
    status,
    notes: notes?.trim() || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection("Booking").insertOne(bookingData);
  const created = await db.collection("Booking").findOne({ _id: result.insertedId });

  return NextResponse.json({ success: true, booking: formatDocument(created) });
}
