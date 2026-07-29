// components/notifications/NotificationBell.tsx
// Sprint 7 — Bell icon button + badge + toggle
//
// Drop into your dashboard Navbar / Header:
//   <NotificationBell />

"use client";

import { useCallback, useState } from "react";
import { Bell } from "lucide-react";
import { NotificationPanel } from "./NotificationPanel";
import { useUnreadCount } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { count, setCount } = useUnreadCount();

  const toggle = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <div className="relative">
      <button
        onClick={toggle}
        aria-label={`Notifications${count > 0 ? `, ${count} unread` : ""}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          "relative p-2 rounded-full transition-colors",
          open
            ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
            : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200"
        )}
      >
        <Bell className="w-5 h-5" />

        {/* Unread badge */}
        {count > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1 right-1 min-w-[0.875rem] h-3.5 px-0.5 flex items-center justify-center rounded-full bg-indigo-600 text-white text-[9px] font-bold leading-none"
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <NotificationPanel
          onClose={close}
          onUnreadCountChange={setCount}
        />
      )}
    </div>
  );
}
