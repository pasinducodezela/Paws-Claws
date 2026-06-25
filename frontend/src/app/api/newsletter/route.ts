import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const db = await getDb();
    
    // Check if already subscribed
    const existing = await db.collection("Subscriber").findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: "Email is already subscribed" }, { status: 400 });
    }

    const subscriber = {
      email: email.toLowerCase(),
      createdAt: new Date(),
      status: "SUBSCRIBED"
    };

    await db.collection("Subscriber").insertOne(subscriber);

    return NextResponse.json({ success: true, message: "Subscribed successfully!" });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
