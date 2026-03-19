"use client";

import { Button } from "@/components/ui/button";
import { Menu, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/app/firebase/firebase";

type AuthStatus =
  | "unauthenticated"
  | "authenticated_unregistered"
  | "authenticated_registered";
type LoadingAction = "signin" | "started" | null;

function getAuthStatus(): Promise<AuthStatus> {
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
          userSnap.exists()
            ? "authenticated_registered"
            : "authenticated_unregistered",
        );
      } catch {
        resolve("authenticated_unregistered");
      }
    });
  });
}

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null);
  const router = useRouter();

  // "Sign In" — goes to dashboard if registered, otherwise /login
  const handleSignIn = useCallback(async () => {
    setLoadingAction("signin");
    try {
      const status = await getAuthStatus();
      router.push(
        status === "authenticated_registered" ? "/tutor/dashboard" : "/login",
      );
    } finally {
      setLoadingAction(null);
      setMenuOpen(false);
    }
  }, [router]);

  // "Get Started" — three-way: dashboard / register / signup
  const handleGetStarted = useCallback(async () => {
    setLoadingAction("started");
    try {
      const status = await getAuthStatus();
      if (status === "authenticated_registered")
        router.push("/tutor/dashboard");
      else if (status === "authenticated_unregistered")
        router.push("/register");
      else router.push("/signup");
    } finally {
      setLoadingAction(null);
      setMenuOpen(false);
    }
  }, [router]);

  return (
    <header className="w-full bg-background/95 border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-semibold">
            <Image
              alt="kopa360-logo"
              src="/kopa360-logo.png"
              width={150}
              height={30}
            />
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          {/* <Link
            href="/signup"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Become a Tutor
          </Link> */}

          <Button
            variant="outline"
            size="sm"
            disabled={loadingAction !== null}
            onClick={handleSignIn}
          >
            {loadingAction === "signin" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Sign In"
            )}
          </Button>

          <Button
            size="sm"
            disabled={loadingAction !== null}
            onClick={handleGetStarted}
          >
            {loadingAction === "started" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Get Started"
            )}
          </Button>
        </nav>
        {/* ← closing tag that was missing */}

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border overflow-hidden"
          >
            <nav className="flex flex-col p-4 gap-2 bg-background">
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-accent"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
              {/* <Link
                href="/signup"
                className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-accent"
                onClick={() => setMenuOpen(false)}
              >
                Become a Tutor
              </Link> */}
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={loadingAction !== null}
                  onClick={handleSignIn}
                >
                  {loadingAction === "signin" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <Button
                  className="flex-1"
                  disabled={loadingAction !== null}
                  onClick={handleGetStarted}
                >
                  {loadingAction === "started" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Get Started"
                  )}
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
