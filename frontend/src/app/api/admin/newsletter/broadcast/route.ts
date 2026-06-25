import { NextResponse } from "next/server";
import { getAdminSession, adminUnauthorized } from "@/lib/api";
import { getDb } from "@/lib/mongodb";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return adminUnauthorized();

  try {
    const { subject, message } = await request.json();

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
    }

    const db = await getDb();
    const subscribers = await db.collection("Subscriber").find({ status: "SUBSCRIBED" }).toArray();

    if (subscribers.length === 0) {
      return NextResponse.json({ error: "No active subscribers found" }, { status: 400 });
    }

    // Configure Nodemailer transporter
    // For this to work, you MUST set SMTP_EMAIL and SMTP_PASSWORD in your .env file
    const transporter = nodemailer.createTransport({
      service: "gmail", // You can change this to another SMTP service
      auth: {
        user: process.env.SMTP_EMAIL || "",
        pass: process.env.SMTP_PASSWORD || "",
      },
    });

    const emails = subscribers.map((sub) => sub.email);

    // Send broadcast
    await transporter.sendMail({
      from: `"Paws & Claws" <${process.env.SMTP_EMAIL}>`,
      bcc: emails, // Use BCC so subscribers can't see each other's emails
      subject,
      text: message,
      html: `<div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #f59e0b;">Paws & Claws Update</h2>
              <div style="white-space: pre-wrap; font-size: 16px; line-height: 1.5;">${message}</div>
              <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;" />
              <p style="font-size: 12px; color: #999;">You are receiving this email because you subscribed to the Paws & Claws newsletter.</p>
             </div>`,
    });

    return NextResponse.json({ success: true, count: emails.length });
  } catch (error: any) {
    console.error("Broadcast failed:", error);
    return NextResponse.json({ error: error.message || "Failed to send broadcast" }, { status: 500 });
  }
}
