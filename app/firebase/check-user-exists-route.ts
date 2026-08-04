import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/app/firebase/firebase-admin";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * POST { email } -> { exists: boolean }
 *
 * Deliberately returns nothing but a boolean — never the matched
 * document's fields — so this endpoint can't be used to scrape profile
 * data even by someone probing it directly. Runs with Admin SDK
 * privileges server-side, so it isn't subject to (and doesn't need
 * changes to) the client Firestore security rules.
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    }

    const normalizedEmail = normalizeEmail(email);

    const snapshot = await adminDb
      .collection("users")
      .where("email", "==", normalizedEmail)
      .limit(1)
      .get();

    return NextResponse.json({ exists: !snapshot.empty });
  } catch (error) {
    console.error("[v0] check-user-exists error:", error);
    return NextResponse.json(
      { error: "Failed to check account." },
      { status: 500 },
    );
  }
}
