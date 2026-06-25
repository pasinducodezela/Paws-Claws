import { NextResponse } from "next/server";

import { getDb } from "@/lib/mongodb";
import { formatDocument } from "@/lib/api";

export async function POST(request: Request) {
  const { name, email, subject, message } = await request.json();

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const db = await getDb();
  const created = await db.collection("Inquiry").insertOne({
    name: name.trim(),
    email: email.trim(),
    subject: subject.trim(),
    message: message.trim(),
    status: "OPEN",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const inquiry = await db.collection("Inquiry").findOne({ _id: created.insertedId });
  return NextResponse.json({ success: true, inquiry: formatDocument(inquiry) });
}
