import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { getDb } from "@/lib/mongodb";
import { formatDocument } from "@/lib/api";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Missing sitter ID" }, { status: 400 });
  }

  const db = await getDb();

  let sitter;
  try {
    sitter = await db.collection("Sitter").findOne({ _id: new ObjectId(id) });
  } catch {
    return NextResponse.json({ error: "Invalid sitter ID" }, { status: 400 });
  }

  if (!sitter) {
    return NextResponse.json({ error: "Sitter not found" }, { status: 404 });
  }

  return NextResponse.json(formatDocument(sitter));
}
