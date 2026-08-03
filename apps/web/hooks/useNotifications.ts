// hooks/useNotifications.ts
// Sprint 7 — Notifications data hooks

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "@/lib/axios";
import type {
  Notification,
  NotificationListResponse,
  MarkReadPayload,
} from "@/types/notifications";

const POLL_INTERVAL_MS = 30_000; // 30 s

// ─────────────────────────────────────────────────────────────────────────────
// useUnreadCount — lightweight poller for the bell badge
// ─────────────────────────────────────────────────────────────────────────────
export function useUnreadCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchCount = async () => {
      try {
        const { data } = await axios.get<{ unreadCount: number }>(
          "/notifications/unread-count"
        );
        if (!cancelled) setCount(data.unreadCount);
      } catch {
        // silent — don't flash errors for a background poll
      }
    };

    fetchCount();
    const id = setInterval(fetchCount, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return { count, setCount };
}

// ─────────────────────────────────────────────────────────────────────────────
// useNotifications — full list with pagination + read/delete actions
// ─────────────────────────────────────────────────────────────────────────────
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cursorRef = useRef<string | undefined>(undefined);

  const fetchPage = useCallback(
    async (replace = false) => {
      replace ? setLoading(true) : setLoadingMore(true);
      try {
        const params: Record<string, string> = {};
        if (!replace && cursorRef.current) params.cursor = cursorRef.current;

        const { data } = await axios.get<NotificationListResponse>(
          "/notifications",
          { params }
        );

        setNotifications((prev) =>
          replace ? data.notifications : [...prev, ...data.notifications]
        );
        setUnreadCount(data.unreadCount);
        setHasMore(data.hasMore);
        cursorRef.current = data.cursor;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load notifications");
      } finally {
        replace ? setLoading(false) : setLoadingMore(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    fetchPage(true);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) fetchPage(false);
  }, [fetchPage, loadingMore, hasMore]);

  const refresh = useCallback(() => {
    cursorRef.current = undefined;
    fetchPage(true);
  }, [fetchPage]);

  // ── Mark one or all as read ──────────────────────────────────────────────
  const markRead = useCallback(async (payload?: MarkReadPayload) => {
    try {
      const { data } = await axios.patch<{ updated: number; unreadCount: number }>(
        "/notifications/read",
        payload ?? {}
      );
      setUnreadCount(data.unreadCount);

      if (payload?.ids?.length) {
        const idSet = new Set(payload.ids);
        setNotifications((prev) =>
          prev.map((n) => (idSet.has(n.id) ? { ...n, read: true } : n))
        );
      } else {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch {
      // bubble up if needed — caller can handle
    }
  }, []);

  const markAllRead = useCallback(() => markRead(), [markRead]);

  // ── Delete a notification ───────────────────────────────────────────────
  const deleteNotification = useCallback(async (id: string) => {
    // Optimistic remove
    setNotifications((prev) => {
      const removed = prev.find((n) => n.id === id);
      if (removed && !removed.read) setUnreadCount((c) => Math.max(0, c - 1));
      return prev.filter((n) => n.id !== id);
    });
    try {
      await axios.delete(`/notifications/${id}`);
    } catch {
      // re-fetch to reconcile on failure
      refresh();
    }
  }, [refresh]);

  return {
    notifications,
    unreadCount,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
    markRead,
    markAllRead,
    deleteNotification,
  };
}
