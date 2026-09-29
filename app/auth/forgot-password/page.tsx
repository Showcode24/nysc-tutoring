"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/app/firebase/firebase";
import { ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

// Maps the Firebase Auth error codes this flow can actually hit to plain
// messages. Deliberately generic on "user not found" — confirming an email
// is unregistered from a public form is an account-enumeration leak.
function getResetErrorMessage(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      // auth/user-not-found is intentionally treated the same as success —
      // see getResetErrorMessage above. Every other error is surfaced.
      if (err?.code && err.code !== "auth/user-not-found") {
        setError(getResetErrorMessage(err.code));
        setIsLoading(false);
        return;
      }
    }

    setSent(true);
    setIsLoading(false);
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-cream px-5 py-16">
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-cream">
              <span className="font-display text-lg leading-none">K</span>
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-ink">
              Kopa<span className="text-terracotta">360</span>
            </span>
          </Link>
          <h1 className="mt-6 font-display text-4xl leading-[1.05] tracking-[-0.02em] text-ink">
            Reset your <span className="italic text-terracotta">password</span>
          </h1>
          <p className="mt-2 text-[15px] text-ink-soft">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <div className="rounded-3xl border border-line bg-white p-7 shadow-[0_1px_0_rgba(20,15,10,0.04),0_20px_60px_-30px_rgba(20,15,10,0.25)] md:p-8">
          {sent ? (
            <div className="space-y-5 text-center">
              <div className="flex justify-center">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-sage/15 text-sage">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </div>
              <div>
                <p className="font-display text-xl text-ink">Check your inbox</p>
                <p className="mt-1.5 text-sm text-ink-soft">
                  If an account exists for{" "}
                  <span className="font-medium text-ink">{email}</span>, a
                  password reset link is on its way. It may take a minute to
                  arrive — check spam too.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-cream transition hover:bg-terracotta"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-terracotta/25 bg-terracotta/5 px-4 py-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
                  <p className="text-sm text-terracotta">{error}</p>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="mt-2 w-full rounded-xl border border-line bg-sand/40 px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft/60 transition focus:border-terracotta/50 focus:bg-white focus:outline-none disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-cream transition hover:bg-terracotta disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Send reset link
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 border-t border-line pt-6 text-center text-sm">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 font-medium text-terracotta hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
