"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PublicLayout } from "../src/components/layouts/public-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { loginUser } from "@/app/firebase/loginService";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tutorEmail, setTutorEmail] = useState("");
  const [tutorPassword, setTutorPassword] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [tutorError, setTutorError] = useState("");
  const [adminError, setAdminError] = useState("");

  const handleTutorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setTutorError("");
    setIsLoading(true);

    try {
      const result = await loginUser(tutorEmail, tutorPassword);

      // Check notRegistered BEFORE the generic !result.success check
      if (result.notRegistered) {
        setIsLoading(false);
        router.push("/register");
        return;
      }

      if (!result.success) {
        setTutorError(result.error || "Login failed. Please try again.");
        setIsLoading(false);
        return;
      }

      if (!result.verified) {
        toast({
          title: "Email Verification Required",
          description:
            "Please verify your email before accessing your account.",
          variant: "destructive",
        });
        setIsLoading(false);
        router.push(`/verify-email?email=${encodeURIComponent(tutorEmail)}`);
        return;
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      setIsLoading(false);
      router.push("/tutor/dashboard");
    } catch (error) {
      setTutorError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");
    setIsLoading(true);

    try {
      const result = await loginUser(adminEmail, adminPassword);

      if (!result.success) {
        setAdminError(result.error || "Login failed. Please try again.");
        setIsLoading(false);
        return;
      }

      if (result.role !== "admin" && result.role !== "super_admin") {
        setAdminError("This account does not have admin access.");
        setIsLoading(false);
        return;
      }

      // No email verification check — admins bypass this
      toast({
        title: "Welcome back, Admin!",
        description: "You have successfully signed in.",
      });

      setIsLoading(false);
      router.push("/admin/dashboard");
    } catch (error) {
      setAdminError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <PublicLayout showFooter={false}>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to your Kopa360 account
            </p>
          </div>

          <div className="card-elevated p-6 md:p-8">
            <Tabs defaultValue="tutor" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="tutor">Tutor</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>

              <TabsContent value="tutor">
                <form onSubmit={handleTutorLogin} className="space-y-4">
                  {tutorError && (
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                      <p className="text-sm text-destructive">{tutorError}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="tutor-email">Email</Label>
                    <Input
                      id="tutor-email"
                      type="email"
                      placeholder="you@example.com"
                      value={tutorEmail}
                      onChange={(e) => setTutorEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="tutor-password">Password</Label>
                      <Link
                        href="/auth/forgot-password"
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="tutor-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={tutorPassword}
                        onChange={(e) => setTutorPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                  <span className="text-muted-foreground">
                    Don't have an account?{" "}
                  </span>
                  <Link
                    href="/register"
                    className="text-primary hover:underline font-medium"
                  >
                    Apply as a tutor
                  </Link>
                </div>
              </TabsContent>

              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  {adminError && (
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                      <p className="text-sm text-destructive">{adminError}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Admin Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@Kopa360.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="admin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In as Admin"}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </form>

                <p className="mt-4 text-xs text-center text-muted-foreground">
                  Admin access is restricted to authorized personnel only.
                </p>
              </TabsContent>
            </Tabs>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            By signing in, you agree to our{" "}
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
