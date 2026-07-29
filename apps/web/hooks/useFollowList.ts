// hooks/useFollowList.ts
// Sprint 7 — Follow list data hook

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "@/lib/axios";
import type { FollowListResponse, FollowTab, FollowUser } from "@/types/follow";

export function useFollowList(userId: string, tab: FollowTab) {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [total, setTotal] = useState(0);
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

        const { data } = await axios.get<FollowListResponse>(
          `/users/${userId}/${tab}`,
          { params }
        );

        setUsers((prev) => (replace ? data.users : [...prev, ...data.users]));
        setTotal(data.total);
        setHasMore(data.hasMore);
        cursorRef.current = data.cursor;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load users");
      } finally {
        replace ? setLoading(false) : setLoadingMore(false);
      }
    },
    [userId, tab]
  );

  // Reset + fetch when tab or userId changes
  useEffect(() => {
    cursorRef.current = undefined;
    setUsers([]);
    fetchPage(true);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) fetchPage(false);
  }, [fetchPage, loadingMore, hasMore]);

  // Optimistic toggle for follow/unfollow within the modal
  const toggleFollow = useCallback((targetId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === targetId ? { ...u, isFollowing: !u.isFollowing } : u
      )
    );
  }, []);

  return { users, total, loading, loadingMore, hasMore, error, loadMore, toggleFollow };
}
