"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// import { PublicLayout } from "../src/components/layouts/public-layout";
import { Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { loginUser } from "@/app/firebase/loginService";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [accountNotFound, setAccountNotFound] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setAccountNotFound(false);
    setIsLoading(true);

    try {
      const result = await loginUser(email, password);

      // Check accountNotFound before the generic !result.success check —
      // it needs its own message and a link to signup, not the generic
      // error box.
      if (result.accountNotFound) {
        setError(result.error || "No account found with this email.");
        setAccountNotFound(true);
        setIsLoading(false);
        return;
      }

      if (!result.success) {
        setError(result.error || "Login failed. Please try again.");
        setIsLoading(false);
        return;
      }

      switch (result.state) {
        case "UNVERIFIED":
          toast({
            title: "Email verification required",
            description:
              "Please verify your email before accessing your account.",
            variant: "destructive",
          });
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
          break;

        case "PROFILE_MISSING":
        case "PROFILE_INCOMPLETE":
          router.push("/register");
          break;

        case "READY":
        default:
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
          router.push("/tutor/dashboard");
          break;
      }

      setIsLoading(false);
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    // <PublicLayout showFooter={false}>
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-cream px-5 py-16">
      {/* ghosted serif numeral — same editorial device as the landing page's footer wordmark */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-12 -top-16 select-none font-display text-[240px] leading-none text-ink/[0.03]"
      >
        360
      </div>

      <div className="animate-rise relative w-full max-w-md">
        {/* Brand mark */}
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
            Welcome <span className="italic text-terracotta">back</span>
          </h1>
          <p className="mt-2 text-[15px] text-ink-soft">
            Sign in to manage your sessions and students.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-line bg-white p-7 shadow-[0_1px_0_rgba(20,15,10,0.04),0_20px_60px_-30px_rgba(20,15,10,0.25)] md:p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-terracotta/25 bg-terracotta/5 px-4 py-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
                <div>
                  <p className="text-sm text-terracotta">{error}</p>
                  {accountNotFound && (
                    <Link
                      href="/signup"
                      className="mt-1 inline-block text-sm font-medium text-terracotta underline"
                    >
                      Create an account
                    </Link>
                  )}
                </div>
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

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft"
                >
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-medium text-terracotta hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-2">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full rounded-xl border border-line bg-sand/40 px-4 py-3 pr-11 text-[15px] text-ink placeholder:text-ink-soft/60 transition focus:border-terracotta/50 focus:bg-white focus:outline-none disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-0 top-0 grid h-full w-11 place-items-center text-ink-soft transition hover:text-ink disabled:opacity-60"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
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
                  Sign in
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-line pt-6 text-center text-sm">
            <span className="text-ink-soft">Don&apos;t have an account? </span>
            <Link
              href="/signup"
              className="font-medium text-terracotta hover:underline"
            >
              Apply as a tutor
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-ink-soft">
          By signing in, you agree to our{" "}
          <a href="#" className="underline hover:text-ink">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline hover:text-ink">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
    // </PublicLayout>
  );
}
