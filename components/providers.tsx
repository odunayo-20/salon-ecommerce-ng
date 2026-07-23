"use client";

import { SessionProvider } from "next-auth/react";
import { usePushRegistration } from "@/hooks/use-push-registration";

function PushRegistration() {
  usePushRegistration();
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PushRegistration />
      {children}
    </SessionProvider>
  );
}
