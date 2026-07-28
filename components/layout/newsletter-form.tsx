"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";

export function NewsletterForm({ source = "footer" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message);
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
          className="flex-1 bg-white/10 border border-white/10 rounded-full px-6 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-gold transition-colors min-h-[44px]"
          required
        />
        <Button type="submit" disabled={status === "loading"} className="bg-gold text-white hover:bg-gold-dark rounded-full px-8 text-xs font-semibold tracking-wider uppercase min-h-[44px] shrink-0">
          {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
        </Button>
      </form>
      {status === "success" && <p className="text-sm text-green-400 mt-2 flex items-center gap-1"><Check className="h-3.5 w-3.5" />{message}</p>}
      {status === "error" && <p className="text-sm text-red-400 mt-2">{message}</p>}
    </div>
  );
}
