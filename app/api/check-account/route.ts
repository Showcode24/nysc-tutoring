import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";

// Initialise Admin SDK once (safe across hot reloads)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

// ─────────────────────────────────────────────────────────────
//  POST /api/check-account
//  Body: { email: string }
//
//  Checks Firebase AUTHENTICATION directly (not Firestore) for whether
//  an account exists with this email, using the Admin SDK. This runs
//  server-side on purpose: the client never needs read/query access to
//  the `users` collection before signing in, and this checks the actual
//  source of truth for account existence rather than a Firestore doc
//  that could in principle be missing or out of sync.
// ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "A valid email is required." },
        { status: 400 },
      );
    }

    try {
      await admin.auth().getUserByEmail(email);
      return NextResponse.json({ exists: true });
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        return NextResponse.json({ exists: false });
      }
      throw error;
    }
  } catch (error: any) {
    console.error("[check-account] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 },
    );
  }
}
