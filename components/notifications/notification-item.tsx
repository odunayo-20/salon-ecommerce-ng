"use client";

import Link from "next/link";
import {
  Calendar,
  ShoppingBag,
  CreditCard,
  Star,
  User,
  MessageSquare,
  Info,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

const typeIcons: Record<string, typeof Calendar> = {
  info: Info,
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  booking: Calendar,
  order: ShoppingBag,
  payment: CreditCard,
  review: Star,
  account: User,
  otp: MessageSquare,
};

const typeColors: Record<string, string> = {
  info: "bg-blue-50 text-blue-500",
  success: "bg-green-50 text-green-500",
  error: "bg-red-50 text-red-500",
  warning: "bg-amber-50 text-amber-500",
  booking: "bg-purple-50 text-purple-500",
  order: "bg-blue-50 text-blue-500",
  payment: "bg-green-50 text-green-500",
  review: "bg-gold/10 text-gold",
  account: "bg-charcoal/5 text-charcoal",
  otp: "bg-orange-50 text-orange-500",
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onClose: () => void;
}

export function NotificationItem({ notification, onMarkRead, onClose }: NotificationItemProps) {
  const Icon = typeIcons[notification.type] || Info;
  const colorClass = typeColors[notification.type] || "bg-gray-50 text-gray-500";

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkRead(notification.id);
    }
    onClose();
  };

  const content = (
    <div
      onClick={handleClick}
      className={cn(
        "flex gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-border/50 last:border-0",
        notification.isRead
          ? "hover:bg-cream/30"
          : "bg-gold/5 hover:bg-gold/10"
      )}
    >
      <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", colorClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            "text-sm leading-snug",
            notification.isRead ? "text-charcoal" : "text-charcoal font-medium"
          )}>
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="h-2 w-2 rounded-full bg-gold shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(notification.createdAt)}</p>
      </div>
    </div>
  );

  if (notification.actionUrl) {
    return (
      <Link href={notification.actionUrl} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
