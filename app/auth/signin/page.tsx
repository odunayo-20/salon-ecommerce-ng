"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter your email and password");
      return;
    }

    setLoading(true);
    setError("");

  try {
  const result = await signIn("credentials", {
    email: email.trim().toLowerCase(),
    password,
    redirect: false,
  });

  if (result?.error) {
    setError("Invalid email or password. Please try again.");
    return;
  }

  // Get the updated session
  const session = await getSession();

  toast.success("Welcome back!", {
    description: "You've been signed in successfully.",
  });

  if (session?.user?.role === "ADMIN") {
    router.push("/admin");
  } else {
    router.push("/dashboard");
  }

  router.refresh();
} catch {
  setError("Something went wrong. Please try again.");
} finally {
  setLoading(false);
}
  }

  return (
    <div className="min-h-screen flex">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-block mb-8">
            <span className="font-heading text-3xl font-semibold text-charcoal tracking-tight">MecBill</span>
            <span className="font-heading text-3xl font-light text-gold ml-0.5">Tech</span>
          </Link>

          <h1 className="font-heading text-2xl font-bold text-charcoal tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground mt-1 text-sm">Sign in to manage your appointments and orders</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full bg-cream border border-border rounded-full pl-10 pr-4 py-3 text-sm text-charcoal placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full bg-cream border border-border rounded-full pl-10 pr-12 py-3 text-sm text-charcoal placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-charcoal"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-charcoal text-white hover:bg-charcoal-light rounded-full py-6 text-xs font-semibold tracking-wider uppercase"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-gold hover:text-gold-dark font-medium">Create one</Link>
          </p>
        </div>
      </div>

      {/* Right - Image */}
      <div className="hidden lg:block w-1/2 bg-cream relative">
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal/5 to-charcoal/10 flex items-center justify-center">
          <div className="text-center">
            <span className="font-heading text-6xl font-bold text-charcoal/10">M</span>
          </div>
        </div>
      </div>
    </div>
  );
}
