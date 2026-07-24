"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NotificationPanel } from "./notification-panel";
import { useUnreadCount } from "@/hooks/queries";

interface NotificationBellProps {
  className?: string;
  variant?: "default" | "admin";
}

export function NotificationBell({ className, variant = "default" }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { data, refetch } = useUnreadCount(15_000);
  const unreadCount = data?.count ?? 0;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={panelRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative",
          variant === "admin"
            ? "text-white/70 hover:text-white"
            : "text-charcoal hover:text-gold",
          className
        )}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-gold animate-pulse" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-[16px] rounded-full bg-gold text-white text-[9px] font-bold flex items-center justify-center px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        <span className="sr-only">Notifications</span>
      </Button>

      {isOpen && (
        <NotificationPanel
          onClose={() => setIsOpen(false)}
          onRead={() => refetch()}
          onReadAll={() => refetch()}
        />
      )}
    </div>
  );
}
