"use client";

import { Navbar, MobileBottomNav, StickyBookingButton } from "./navbar";
import { Footer } from "./footer";
import { CartDrawer } from "@/components/cart/cart-drawer";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileBottomNav />
      <StickyBookingButton />
      <CartDrawer />
    </div>
  );
}
