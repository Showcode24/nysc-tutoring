"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/app/firebase/firebase";
import { applyActionCode } from "firebase/auth"; // Required to actually verify the code
import { syncVerificationToFirestore } from "@/app/firebase/signupService";

export default function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const processVerification = async () => {
      const oobCode = searchParams.get("oobCode");
      const mode = searchParams.get("mode");

      try {
        // 1. Check if we have a verification code in the URL
        if (oobCode && mode === "verifyEmail") {
          // ACTUALLY APPLY THE CODE TO FIREBASE
          await applyActionCode(auth, oobCode);
          console.log("[Verify] Code applied successfully.");
        }

        // 2. Check current auth state
        const user = auth.currentUser;

        if (user) {
          setUserEmail(user.email || "");

          // Force Firebase to refresh the user's data from the server
          await user.reload();
          const updatedUser = auth.currentUser;

          if (updatedUser?.emailVerified) {
            // 3. Sync the "Verified" status to your Firestore users collection
            await syncVerificationToFirestore(updatedUser.uid);

            setMessage(
              "Email verified successfully! Redirecting to dashboard...",
            );
            setIsVerifying(false);
            setTimeout(() => router.push("/dashboard"), 2500);
          } else {
            // This happens if the user reloads the page without clicking the email link
            setMessage(
              "Your email is not yet verified. Please click the link in your inbox.",
            );
            setIsVerifying(false);
          }
        } else {
          // 4. Handle case where user is not logged in on this browser/tab
          if (oobCode) {
            setMessage("Email verified! Please log in to continue.");
          } else {
            setMessage("No active session found. Please log in.");
          }
          setIsVerifying(false);
          setTimeout(() => router.push("/login"), 3000);
        }
      } catch (error: any) {
        console.error("[Verify] Error:", error);

        // Handle specific Firebase error for expired/used links
        if (error.code === "auth/invalid-action-code") {
          setMessage("This link has expired or has already been used.");
        } else {
          setMessage("An error occurred during verification.");
        }
        setIsVerifying(false);
      }
    };

    processVerification();
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Email Verification
        </h1>

        {isVerifying ? (
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
            <p className="text-gray-500 font-medium">
              Processing your request...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div
              className={`p-4 rounded-lg flex flex-col items-center gap-2 ${
                message.includes("successfully") ||
                message.includes("verified!")
                  ? "bg-green-50 text-green-800 border border-green-100"
                  : "bg-amber-50 text-amber-800 border border-amber-100"
              }`}
            >
              <span className="text-lg font-bold">
                {message.includes("successfully") ||
                message.includes("verified!")
                  ? "✓ Success"
                  : "⚠ Notice"}
              </span>
              <p className="text-sm leading-relaxed">{message}</p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push("/login")}
                className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                Go to Login
              </button>

              {!message.includes("successfully") && (
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Try again
                </button>
              )}
            </div>
          </div>
        )}

        {userEmail && !message.includes("successfully") && (
          <p className="text-xs text-gray-400 mt-8 italic">
            Signed in as: {userEmail}
          </p>
        )}
      </div>
    </div>
  );
}
