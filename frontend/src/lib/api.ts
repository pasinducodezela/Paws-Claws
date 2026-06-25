import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { authOptions } from "@/lib/auth";

export async function getAdminSession() {
  return await getServerSession(authOptions);
}

export function adminUnauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function normalizeValue(value: unknown): unknown {
  if (value instanceof ObjectId) {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item));
  }

  if (value && typeof value === "object") {
    return formatDocument(value as Record<string, any>);
  }

  return value;
}

export function formatDocument(document: Record<string, any> | null) {
  if (!document) {
    return null;
  }

  const formatted: Record<string, any> = {};

  for (const [key, value] of Object.entries(document)) {
    if (key === "_id") {
      formatted.id = value instanceof ObjectId ? value.toString() : value;
      continue;
    }

    formatted[key] = normalizeValue(value);
  }

  return formatted;
}

export function formatDocuments(documents: Array<Record<string, any>>) {
  return documents.map((document) => formatDocument(document));
}
