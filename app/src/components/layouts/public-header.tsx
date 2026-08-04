"use client";

import { Button } from "@/components/ui/button";
import { Menu, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
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
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  // Transparent over hero, solidifies once content scrolls beneath it
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <header
      className={`w-full sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-black/80 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-12">
        <Link href="/" className="flex items-center">
          <Image
            alt="kopa360"
            src="/kopa360-logo-white.png"
            width={96}
            height={20}
            priority
          />
        </Link>

        {/* Plain text links — no button chrome except the one real conversion action */}
        <nav className="hidden md:flex items-center gap-7">
          <Link
            href="/"
            className="text-[13px] text-white/80 hover:text-white transition-colors"
          >
            Home
          </Link>
          <Link
            href="/become-tutor"
            className="text-[13px] text-white/80 hover:text-white transition-colors"
          >
            Become a Tutor
          </Link>
          <button
            onClick={handleSignIn}
            disabled={loadingAction !== null}
            className="text-[13px] text-white/80 hover:text-white transition-colors disabled:opacity-50"
          >
            {loadingAction === "signin" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>
          <Button
            size="sm"
            disabled={loadingAction !== null}
            onClick={handleGetStarted}
            className="rounded-full h-8 px-4 text-[13px] bg-white text-black hover:bg-white/90"
          >
            {loadingAction === "started" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              "Get Started"
            )}
          </Button>
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-white hover:bg-white/10 hover:text-white h-8 w-8"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black overflow-hidden"
          >
            <nav className="flex flex-col p-5 gap-1">
              <Link
                href="/"
                className="px-3 py-2.5 text-sm text-white/80 hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/become-tutor"
                className="px-3 py-2.5 text-sm text-white/80 hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                Become a Tutor
              </Link>
              <button
                onClick={handleSignIn}
                disabled={loadingAction !== null}
                className="px-3 py-2.5 text-sm text-left text-white/80 hover:text-white disabled:opacity-50"
              >
                {loadingAction === "signin" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Sign In"
                )}
              </button>
              {/* <Button
                className="mt-2 rounded-full h-10 bg-white text-black hover:bg-white/90"
                disabled={loadingAction !== null}
                onClick={handleGetStarted}
              >
                {loadingAction === "started" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Get Started"
                )}
              </Button> */}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
