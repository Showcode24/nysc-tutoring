"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { auth } from "@/app/firebase/firebase";
import { isEmailVerified } from "@/app/firebase/signupService";

interface ProtectedPageWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

function VerifyingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-terracotta" />
        <p className="font-display text-lg text-ink">Verifying your email…</p>
      </div>
    </div>
  );
}

export default function ProtectedPageWrapper({
  children,
  fallback = <VerifyingScreen />,
}: ProtectedPageWrapperProps) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkVerification = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          router.push("/login");
          return;
        }

        const verified = await isEmailVerified();
        if (!verified) {
          router.push("/verify-email");
          return;
        }

        setIsVerified(true);
        setLoading(false);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Verification check failed";
        setError(errorMessage);
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      checkVerification();
    });

    return () => unsubscribe();
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream px-6 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-terracotta/10 text-terracotta">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <p className="font-display text-xl text-ink">Something went wrong</p>
          <p className="mt-1 max-w-sm text-sm text-ink-soft">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-cream transition hover:bg-terracotta"
        >
          Try again
        </button>
      </div>
    );
  }

  if (loading) {
    return <>{fallback}</>;
  }

  if (!isVerified) {
    return null;
  }

  return <>{children}</>;
}