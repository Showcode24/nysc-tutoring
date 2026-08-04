import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Server-only Firebase Admin app. NEVER import this from a "use client"
 * file or a client component — it uses a service account key with full
 * read/write access that bypasses Firestore security rules entirely.
 * Only import it from API routes / Server Actions / Route Handlers.
 */
function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Service account keys pasted into .env files often have literal
      // "\n" sequences instead of real newlines — this restores them.
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export const adminDb = getFirestore(getAdminApp());