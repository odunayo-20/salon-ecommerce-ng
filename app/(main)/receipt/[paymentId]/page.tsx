"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, Download, ArrowLeft } from "lucide-react";

interface Receipt {
  paymentId: string;
  reference: string;
  amount: number;
  totalAmount: number;
  totalPaid: number;
  remaining: number;
  isFullyPaid: boolean;
  paidAt: string;
  customerName: string;
  serviceName: string;
  stylistName: string;
  date: string;
  time: string;
  bookingRef: string;
  paymentHistory: { id: string; amount: number; status: string; reference: string; paidAt: string | null; createdAt: string }[];
}

export default function ReceiptPage() {
  const params = useParams();
  const paymentId = params.paymentId as string;
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const res = await fetch(`/api/payments/${paymentId}/receipt`);
        const data = await res.json();
        if (res.ok && data.receipt) {
          setReceipt(data.receipt);
        } else {
          setError(data.error || "Failed to load receipt");
        }
      } catch {
        setError("Failed to load receipt");
      } finally {
        setLoading(false);
      }
    };
    fetchReceipt();
  }, [paymentId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-gold animate-spin" />
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error || "Receipt not found"}</p>
          <Link href="/dashboard">
            <Button className="bg-charcoal text-white hover:bg-charcoal-light rounded-full text-xs font-semibold tracking-wider uppercase px-6">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Print controls - hidden on print */}
      <div className="no-print bg-white border-b border-border px-6 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-charcoal">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <Button onClick={handlePrint} className="bg-charcoal text-white hover:bg-charcoal-light rounded-full text-xs font-semibold tracking-wider uppercase px-6">
            <Download className="h-3 w-3 mr-2" /> Download / Print
          </Button>
        </div>
      </div>

      {/* Receipt */}
      <div className="flex items-start justify-center py-8 px-4 print:py-0 print:px-0">
        <div className="bg-white border border-border rounded-2xl overflow-hidden max-w-lg w-full print:rounded-none print:border-0 print:shadow-none print:max-w-full">
          {/* Header */}
          <div className="bg-charcoal p-8 text-center">
            <h1 className="text-gold text-lg tracking-[4px] uppercase font-heading">MecBill Tech Salon</h1>
            <p className="text-gray-400 text-xs mt-2 tracking-widest uppercase">Payment Receipt</p>
          </div>

          {/* Body */}
          <div className="p-8">
            {/* Customer */}
            <div className="text-center mb-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Receipt for</p>
              <p className="text-charcoal font-semibold">{receipt.customerName}</p>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-border my-6" />

            {/* Details */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Service</span>
                <span className="text-sm text-charcoal font-medium">{receipt.serviceName}</span>
              </div>
              {receipt.stylistName && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Stylist</span>
                  <span className="text-sm text-charcoal">{receipt.stylistName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Date & Time</span>
                <span className="text-sm text-charcoal">{receipt.date} at {receipt.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Booking Ref</span>
                <span className="text-sm text-charcoal font-mono">{receipt.bookingRef}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-border my-6" />

            {/* Payment Summary */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Service Total</span>
                <span className="text-sm text-charcoal font-semibold">₦{receipt.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment History */}
            {receipt.paymentHistory.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Payment History</p>
                <div className="space-y-1.5">
                  {receipt.paymentHistory.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                          style={{
                            background: p.status === "PAID" ? "#f0fdf4" : "#fffbeb",
                            color: p.status === "PAID" ? "#16a34a" : "#d97706",
                          }}
                        >
                          {p.status}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(p.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-charcoal">₦{p.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-3 pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">Total Paid</span>
                  <span className="text-sm font-bold" style={{ color: "#16a34a" }}>₦{receipt.totalPaid.toLocaleString()}</span>
                </div>
                {receipt.remaining > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Balance Remaining</span>
                    <span className="text-sm font-bold text-amber-600">₦{receipt.remaining.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}

            {/* Status Badge */}
            <div className="mt-6 p-4 rounded-lg text-center" style={{ background: receipt.isFullyPaid ? "#f0fdf4" : "#fffbeb", border: `1px solid ${receipt.isFullyPaid ? "#bbf7d0" : "#fde68a"}` }}>
              <p className="text-sm font-bold" style={{ color: receipt.isFullyPaid ? "#16a34a" : "#d97706" }}>
                {receipt.isFullyPaid ? "PAID IN FULL" : "PARTIAL PAYMENT"}
              </p>
            </div>

            {/* Payment Reference */}
            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">Payment Reference</p>
              <p className="text-sm font-mono text-charcoal mt-1">{receipt.reference}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-muted/30 px-8 py-4 text-center">
            <p className="text-xs text-muted-foreground">Thank you for choosing MecBill Tech Salon</p>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
}
