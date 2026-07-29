// components/notifications/NotificationPanel.tsx
// Sprint 7 — Dropdown panel shown when the bell is clicked

"use client";

import { useCallback, useEffect, useRef } from "react";
import { Check, Loader2, BellOff } from "lucide-react";
import { NotificationItem } from "./NotificationItem";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationPanelProps {
  onClose: () => void;
  /** Called with the new unread count after marking read */
  onUnreadCountChange?: (count: number) => void;
}

export function NotificationPanel({
  onClose,
  onUnreadCountChange,
}: NotificationPanelProps) {
  const {
    notifications,
    unreadCount,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    markRead,
    markAllRead,
    deleteNotification,
  } = useNotifications();

  // Bubble unread count changes up (for the bell badge)
  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
  }, [unreadCount, onUnreadCountChange]);

  // Scroll-based infinite load
  const listRef = useRef<HTMLDivElement>(null);
  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) loadMore();
  }, [loadMore, hasMore]);

  // Close on click outside
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col overflow-hidden max-h-[480px]"
      role="dialog"
      aria-label="Notifications"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full px-1.5 py-0.5 min-w-[1.25rem]">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </h3>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 font-medium transition-colors"
          >
            <Check className="w-3 h-3" />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overscroll-contain divide-y divide-gray-100 dark:divide-gray-800"
      >
        {loading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
          </div>
        )}

        {!loading && error && (
          <p className="text-sm text-red-500 text-center py-10 px-4">{error}</p>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <BellOff className="w-7 h-7 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You're all caught up!
            </p>
          </div>
        )}

        {!loading &&
          notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkRead={(id) => markRead({ ids: [id] })}
              onDelete={deleteNotification}
              onNavigate={onClose}
            />
          ))}

        {loadingMore && (
          <div className="flex justify-center py-3">
            <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
