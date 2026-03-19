"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signUpWithEmail,
  signUpWithGoogle,
  validatePassword,
} from "../firebase/signupService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight, Chrome, MailCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { PublicLayout } from "../src/components/layouts/public-layout";

export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  // ✅ New: track whether signup succeeded and which email was used
  const [verificationSent, setVerificationSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handlePasswordChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, password: value }));

    if (value) {
      const validation = await validatePassword(value);
      setPasswordErrors(validation.errors);
    } else {
      setPasswordErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.email) {
      toast({
        title: "Missing Email",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!formData.password) {
      toast({
        title: "Missing Password",
        description: "Please enter a password.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (passwordErrors.length > 0) {
      toast({
        title: "Weak Password",
        description: "Please fix the password requirements above.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const result = await signUpWithEmail({
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      // ✅ Show the verify-your-email screen instead of redirecting
      setRegisteredEmail(formData.email);
      setVerificationSent(true);
    } else {
      toast({
        title: "Sign Up Failed",
        description: result.message,
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);

    const result = await signUpWithGoogle();

    if (result.success) {
      toast({
        title: "Welcome!",
        description: "Redirecting to registration...",
      });
      setTimeout(() => router.push("/register"), 1500);
    } else {
      toast({
        title: "Google Sign Up Failed",
        description: result.message,
        variant: "destructive",
      });
    }

    setIsGoogleLoading(false);
  };

  // ✅ Email verification holding screen — shown after successful signup
  if (verificationSent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="card-elevated p-8 md:p-10 space-y-5">
            <div className="flex justify-center">
              <div className="bg-green-100 dark:bg-green-900 rounded-full p-4">
                <MailCheck className="w-10 h-10 text-green-600 dark:text-green-300" />
              </div>
            </div>

            <h1 className="text-2xl font-bold">Check your email</h1>

            <p className="text-muted-foreground text-sm leading-relaxed">
              We've sent a verification link to{" "}
              <span className="font-semibold text-foreground">
                {registeredEmail}
              </span>
              .
              <br />
              <br />
              Please click the link in that email to verify your account before
              logging in. The link will expire after 24 hours.
            </p>

            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-xs text-amber-800 dark:text-amber-300">
                ⚠️ You won't be able to log in until your email is verified.
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              Didn't receive it? Check your spam folder, or{" "}
              <button
                onClick={() => {
                  setVerificationSent(false);
                  setFormData({
                    email: registeredEmail,
                    password: "",
                    confirmPassword: "",
                  });
                }}
                className="text-primary hover:underline font-medium"
              >
                try signing up again
              </button>
              .
            </p>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/login")}
            >
              Go to Login
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <PublicLayout showFooter={false}>
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Join Kopa360</h1>
            <p className="text-muted-foreground">
              Start your journey as a tutor today
            </p>
          </div>

          <div className="card-elevated p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handlePasswordChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>

                {formData.password && passwordErrors.length > 0 && (
                  <div className="mt-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-900">
                    <p className="text-xs font-medium text-red-900 dark:text-red-200 mb-1">
                      Password must include:
                    </p>
                    <ul className="text-xs text-red-800 dark:text-red-300 space-y-1">
                      {passwordErrors.map((error, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-500">•</span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {formData.password && passwordErrors.length === 0 && (
                  <div className="mt-2 p-2 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-900">
                    <p className="text-xs font-medium text-green-900 dark:text-green-200">
                      ✓ Password is strong
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>

                {formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      Passwords do not match
                    </p>
                  )}

                {formData.confirmPassword &&
                  formData.password === formData.confirmPassword &&
                  formData.password && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      ✓ Passwords match
                    </p>
                  )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || passwordErrors.length > 0}
              >
                {isLoading ? "Creating Account..." : "Sign Up"}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignUp}
              disabled={isGoogleLoading}
            >
              <Chrome className="w-4 h-4 mr-2" />
              {isGoogleLoading ? "Signing up..." : "Sign up with Google"}
            </Button>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                Already have an account?{" "}
              </span>
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By signing up, you agree to our{" "}
            <a href="#" className="underline hover:text-foreground">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-foreground">
              Privacy Policy
            </a>
          </p>
        </motion.div>
      </div>
    </PublicLayout>
  );
}
