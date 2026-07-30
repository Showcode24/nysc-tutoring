// lib/getAuthStatus.ts
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/app/firebase/firebase";

export type AuthStatus =
  | "unauthenticated"
  | "authenticated_unregistered"
  | "authenticated_registered";

export function getAuthStatus(): Promise<AuthStatus> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      unsubscribe();
      if (!firebaseUser) {
        resolve("unauthenticated");
        return;
      }
      try {
        const userSnap = await getDoc(doc(db, "users", firebaseUser.uid));
        resolve(
          userSnap.exists() ? "authenticated_registered" : "authenticated_unregistered",
        );
      } catch {
        resolve("authenticated_unregistered");
      }
    });
  });
}