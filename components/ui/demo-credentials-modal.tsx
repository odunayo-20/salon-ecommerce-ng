"use client";

import { useState, useEffect } from "react";
import { X, Copy, User, Shield, UserPlus, Check } from "lucide-react";

interface DemoCredentialsModalProps {
  onFill: (email: string, password: string) => void;
}

const accounts = [
  {
    role: "Admin",
    icon: Shield,
    iconColor: "text-red-500",
    iconBg: "bg-red-50",
    description: "Full access — manage services, orders, analytics, stylists",
    email: "meccomputer2@gmail.com",
    password: "123456789",
  },
  {
    role: "Customer",
    icon: User,
    iconColor: "text-gold",
    iconBg: "bg-gold/10",
    description: "Book appointments, shop products, earn loyalty points",
    email: "customer@mecbill.com",
    password: "password123",
  },
];

export function DemoCredentialsModal({ onFill }: DemoCredentialsModalProps) {
  const [open, setOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const dismissed = localStorage.getItem("demo-credentials-dismissed");
    if (!dismissed) setOpen(true);
  }, []);

  const dismiss = () => {
    setOpen(false);
    localStorage.setItem("demo-credentials-dismissed", "true");
  };

  const copy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-gold/10 border border-gold/30 text-gold-dark rounded-full py-2.5 text-xs font-semibold tracking-wider uppercase hover:bg-gold/20 transition-colors min-h-[44px]"
      >
        <UserPlus className="h-4 w-4" />
        View Demo Accounts
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={dismiss} />
          <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-charcoal">
              <div>
                <h2 className="font-heading text-lg font-bold text-white">Demo Accounts</h2>
                <p className="text-white/60 text-xs mt-0.5">Use these to explore the application</p>
              </div>
              <button onClick={dismiss} className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 min-h-[44px] min-w-[44px] flex items-center justify-center">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gold/5 border border-gold/20 rounded-lg px-4 py-3 text-sm text-charcoal">
                <p className="font-medium text-gold-dark">New here?</p>
                <p className="text-muted-foreground text-xs mt-0.5">You can also <span className="font-medium text-charcoal">create your own account</span> as a customer — no demo credentials needed.</p>
              </div>

              {accounts.map((acct) => {
                const Icon = acct.icon;
                return (
                  <div key={acct.role} className="border border-border rounded-xl p-4 hover:border-gold/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`h-10 w-10 rounded-full ${acct.iconBg} flex items-center justify-center shrink-0`}>
                        <Icon className={`h-5 w-5 ${acct.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading font-semibold text-charcoal">{acct.role} Account</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{acct.description}</p>

                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold w-14 shrink-0">Email</span>
                            <code className="flex-1 text-xs bg-cream px-2.5 py-1.5 rounded-md text-charcoal font-mono truncate">{acct.email}</code>
                            <button onClick={() => copy(acct.email, `${acct.role}-email`)} className="text-muted-foreground hover:text-gold p-1 rounded min-h-[32px] min-w-[32px] flex items-center justify-center">
                              {copiedField === `${acct.role}-email` ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold w-14 shrink-0">Password</span>
                            <code className="flex-1 text-xs bg-cream px-2.5 py-1.5 rounded-md text-charcoal font-mono">{acct.password}</code>
                            <button onClick={() => copy(acct.password, `${acct.role}-pw`)} className="text-muted-foreground hover:text-gold p-1 rounded min-h-[32px] min-w-[32px] flex items-center justify-center">
                              {copiedField === `${acct.role}-pw` ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => { onFill(acct.email, acct.password); dismiss(); }}
                          className="mt-3 w-full bg-charcoal text-white hover:bg-charcoal-light rounded-full py-2 text-xs font-semibold tracking-wider uppercase min-h-[44px]"
                        >
                          Use {acct.role} Credentials
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-6 py-4 border-t border-border bg-cream/50 flex justify-end">
              <button onClick={dismiss} className="text-xs text-muted-foreground hover:text-charcoal font-medium min-h-[44px] px-4">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
