"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Please enter your name");
    if (!email.trim()) return setError("Please enter your email");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    if (!agreed) return setError("You must agree to the terms and conditions");

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      const signInResult = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.success("Account created!", { description: "Please sign in with your new account." });
        router.push("/auth/signin");
        return;
      }

      toast.success("Welcome to MecBill Tech!", { description: "Your account has been created." });
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-block mb-8">
            <span className="font-heading text-3xl font-semibold text-charcoal tracking-tight">MecBill</span>
            <span className="font-heading text-3xl font-light text-gold ml-0.5">Tech</span>
          </Link>

          <h1 className="font-heading text-2xl font-bold text-charcoal tracking-tight">Create Your Account</h1>
          <p className="text-muted-foreground mt-1 text-sm">Join the MecBill Tech community and enjoy premium hair experiences</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                  className="w-full bg-cream border border-border rounded-full pl-10 pr-4 py-3 text-sm text-charcoal placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold"
                />
              </div>
            </div>

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
                  placeholder="Create a password (min. 8 characters)"
                  autoComplete="new-password"
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

            <label className="flex items-start gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="rounded border-border mt-0.5"
              />
              <span className="text-muted-foreground">
                I agree to the{" "}
                <Link href="/terms" className="text-gold hover:text-gold-dark">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-gold hover:text-gold-dark">Privacy Policy</Link>
              </span>
            </label>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-charcoal text-white hover:bg-charcoal-light rounded-full py-6 text-xs font-semibold tracking-wider uppercase"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-gold hover:text-gold-dark font-medium">Sign in</Link>
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
