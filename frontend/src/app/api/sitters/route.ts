import { NextResponse } from "next/server";

import { getDb } from "@/lib/mongodb";
import { formatDocuments } from "@/lib/api";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limitValue = url.searchParams.get("limit");
  const db = await getDb();
  const options: Record<string, any> = { sort: { name: 1 } };

  if (limitValue) {
    const parsed = parseInt(limitValue, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      options.limit = parsed;
    }
  }

  const sitters = await db.collection("Sitter").find({}, options).toArray();
  return NextResponse.json(formatDocuments(sitters));
}
