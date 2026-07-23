"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushRegistration() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!VAPID_PUBLIC_KEY) return;

    let subscription: PushSubscription | null = null;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        const sub = subscription.toJSON();
        if (sub.endpoint && sub.keys) {
          await fetch("/api/push/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              endpoint: sub.endpoint,
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth,
            }),
          });
        }
      } catch (error) {
        // Push registration failure is non-critical
        console.debug("Push registration skipped:", error);
      }
    };

    register();

    return () => {
      if (subscription) {
        subscription.unsubscribe().catch(() => {});
      }
    };
  }, [session]);
}
