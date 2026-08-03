// components/notifications/NotificationItem.tsx
// Sprint 7 — Renders a single notification row

"use client";

import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { X, UserPlus, Heart, MessageCircle, Users, AtSign, Bell } from "lucide-react";
import type { Notification, NotificationType } from "@/types/notifications";
import { cn } from "@/lib/utils";

// ─── Icon + colour per type ───────────────────────────────────────────────────
const TYPE_META: Record<
  NotificationType,
  { Icon: React.ElementType; colour: string }
> = {
  FOLLOW:          { Icon: UserPlus,        colour: "text-indigo-500" },
  UNFOLLOW:        { Icon: UserPlus,        colour: "text-gray-400" },
  NOTE_LIKE:       { Icon: Heart,           colour: "text-rose-500" },
  NOTE_COMMENT:    { Icon: MessageCircle,   colour: "text-blue-500" },
  COMMUNITY_JOIN:  { Icon: Users,           colour: "text-emerald-500" },
  COMMUNITY_INVITE:{ Icon: Users,           colour: "text-violet-500" },
  MENTION:         { Icon: AtSign,          colour: "text-amber-500" },
  SYSTEM:          { Icon: Bell,            colour: "text-gray-400" },
};

// ─── Resolve a click target URL for each notification ─────────────────────────
function resolveHref(n: Notification): string | null {
  if (n.type === "FOLLOW" || n.type === "UNFOLLOW") {
    return n.actor?.username
      ? `/dashboard/profile/${n.actor.username}`
      : null;
  }
  if (n.entityType === "note" && n.entityId) {
    return `/dashboard/notes/${n.entityId}`;
  }
  if (n.entityType === "community" && n.entityId) {
    return `/dashboard/communities/${n.entityId}`;
  }
  if (n.entityType === "comment" && n.entityId) {
    return `/dashboard/notes/${n.entityId}`;
  }
  return null;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate?: () => void;
}

export function NotificationItem({
  notification: n,
  onMarkRead,
  onDelete,
  onNavigate,
}: NotificationItemProps) {
  const meta = TYPE_META[n.type] ?? TYPE_META.SYSTEM;
  const href = resolveHref(n);
  const timeAgo = formatDistanceToNowStrict(new Date(n.createdAt), { addSuffix: true });

  const handleClick = () => {
    if (!n.read) onMarkRead(n.id);
    onNavigate?.();
  };

  const inner = (
    <div
      className={cn(
        "group flex items-start gap-3 px-4 py-3 transition-colors",
        !n.read && "bg-indigo-50/60 dark:bg-indigo-950/30",
        href && "hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
      )}
    >
      {/* Actor avatar or type icon */}
      <div className="relative shrink-0 mt-0.5">
        {n.actor?.image ? (
          <Image
            src={n.actor.image}
            alt={n.actor.name ?? "User"}
            width={36}
            height={36}
            className="rounded-full object-cover w-9 h-9"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <meta.Icon className={cn("w-4 h-4", meta.colour)} />
          </div>
        )}
        {/* type icon badge when actor has image */}
        {n.actor?.image && (
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center",
              meta.colour
            )}
          >
            <meta.Icon className="w-2.5 h-2.5" />
          </span>
        )}
      </div>

      {/* Message + time */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
          {n.actor?.name && (
            <span className="font-medium">{n.actor.name} </span>
          )}
          {n.message}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{timeAgo}</p>
      </div>

      {/* Unread dot + delete */}
      <div className="flex items-center gap-1.5 shrink-0 self-center">
        {!n.read && (
          <span
            className="w-2 h-2 rounded-full bg-indigo-500 group-hover:hidden"
            aria-label="Unread"
          />
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(n.id);
          }}
          className="p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Dismiss notification"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} onClick={handleClick} className="block">
        {inner}
      </Link>
    );
  }

  return <div onClick={handleClick}>{inner}</div>;
}
