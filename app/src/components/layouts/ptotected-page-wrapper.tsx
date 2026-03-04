"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/app/firebase/firebase";
import { isEmailVerified } from "@/app/firebase/signupService";

interface ProtectedPageWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function ProtectedPageWrapper({
  children,
  fallback = (
    <div className="flex items-center justify-center min-h-screen">
      Verifying your email...
    </div>
  ),
}: ProtectedPageWrapperProps) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkVerification = async () => {
      try {
        // Check if user is logged in
        const user = auth.currentUser;
        if (!user) {
          console.log("[v0] No user logged in, redirecting to login");
          router.push("/login");
          return;
        }

        // Check if email is verified
        const verified = await isEmailVerified();
        console.log("[v0] Email verification check:", verified);

        if (!verified) {
          console.log("[v0] Email not verified, redirecting to verify-email");
          router.push("/verify-email");
          return;
        }

        setIsVerified(true);
        setLoading(false);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Verification check failed";
        console.error("[v0] Verification error:", errorMessage);
        setError(errorMessage);
        setLoading(false);
      }
    };

    // Subscribe to auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        console.log("[v0] User logged out");
        router.push("/login");
        return;
      }

      checkVerification();
    });

    return () => unsubscribe();
  }, [router]);

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-red-600 font-semibold">Error: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return <>{fallback}</>;
  }

  // Show content only if verified
  if (!isVerified) {
    return null;
  }

  return <>{children}</>;
}
