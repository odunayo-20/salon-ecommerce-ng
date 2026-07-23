"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCheck, Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "./notification-item";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  channel: string;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationPanelProps {
  onClose: () => void;
  onRead: () => void;
  onReadAll: () => void;
}

export function NotificationPanel({ onClose, onRead, onReadAll }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=15");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      onRead();
    } catch {
      // silent
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      onReadAll();
    } catch {
      // silent
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="absolute right-0 top-full mt-2 z-50 w-[380px] max-h-[500px] bg-white rounded-xl shadow-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-cream/30">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-charcoal">Notifications</h3>
          {unreadCount > 0 && (
            <span className="h-5 min-w-[20px] rounded-full bg-gold text-white text-[10px] font-bold flex items-center justify-center px-1.5">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="text-xs text-gold hover:text-gold-dark h-auto py-1"
          >
            {markingAll ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <CheckCheck className="h-3 w-3 mr-1" />
            )}
            Mark all read
          </Button>
        )}
      </div>

      {/* List */}
      <div className="overflow-y-auto max-h-[400px]">
        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="h-5 w-5 text-gold animate-spin mx-auto" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center">
            <Bell className="h-8 w-8 text-border mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={handleMarkRead}
              onClose={onClose}
            />
          ))
        )}
      </div>
    </div>
  );
}
