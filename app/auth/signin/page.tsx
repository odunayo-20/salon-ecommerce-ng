"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-block mb-8">
            <span className="font-heading text-3xl font-semibold text-charcoal tracking-tight">
              MecBill
            </span>
            <span className="font-heading text-3xl font-light text-gold ml-0.5">
              Tech
            </span>
          </Link>

          <h1 className="font-heading text-2xl font-bold text-charcoal tracking-tight">
            Welcome Back
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Sign in to manage your appointments and orders
          </p>

          <form className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full bg-cream border border-border rounded-full pl-10 pr-4 py-3 text-sm text-charcoal placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-border" />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="text-gold hover:text-gold-dark">
                Forgot password?
              </Link>
            </div>

            <Button className="w-full bg-charcoal text-white hover:bg-charcoal-light rounded-full py-6 text-xs font-semibold tracking-wider uppercase">
              Sign In
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-4 text-muted-foreground">or</span>
            </div>
          </div>

          <Button variant="outline" className="w-full rounded-full py-6 text-xs font-semibold tracking-wider uppercase border-border">
            Continue with Google
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-gold hover:text-gold-dark font-medium">
              Create one
            </Link>
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
