"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/app/firebase/firebase";

// Accepts either field name a user doc might use for role — the codebase
// currently writes tutor role to *both* `role` and `userType` (see
// registerTutor() in authService.ts), but nothing here creates admin
// accounts, so we don't know which field an admin doc was actually given.
// Checking both is the safe default until that's standardized on one name.
const ADMIN_ROLES = ["admin", "super_admin"];

interface AdminProtectedWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

function CheckingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-terracotta" />
        <p className="font-display text-lg text-ink">Checking access…</p>
      </div>
    </div>
  );
}

function DeniedScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream px-6 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-terracotta/10 text-terracotta">
        <ShieldAlert className="h-5 w-5" />
      </div>
      <div>
        <p className="font-display text-xl text-ink">Access denied</p>
        <p className="mt-1 max-w-sm text-sm text-ink-soft">
          This area is for admins only. Redirecting you back…
        </p>
      </div>
    </div>
  );
}

export default function AdminProtectedWrapper({
  children,
  fallback = <CheckingScreen />,
}: AdminProtectedWrapperProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "denied" | "allowed">(
    "checking",
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setStatus("denied");
        router.replace("/login");
        return;
      }

      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        const data = userSnap.exists() ? userSnap.data() : undefined;
        const roleValue = data?.userType ?? data?.role;
        const isAdmin =
          typeof roleValue === "string" && ADMIN_ROLES.includes(roleValue);

        if (!isAdmin) {
          setStatus("denied");
          router.replace("/tutor/dashboard");
          return;
        }

        setStatus("allowed");
      } catch (err) {
        console.error("[AdminProtectedWrapper] Role check failed:", err);
        setStatus("denied");
        router.replace("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (status === "checking") return <>{fallback}</>;
  if (status === "denied") return <DeniedScreen />;
  return <>{children}</>;
}
