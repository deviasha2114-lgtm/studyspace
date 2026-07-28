"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { apiClient } from "@/lib/axios";
import { FollowButton } from "./FollowButton";
import { Spinner } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { FollowUser } from "./profile.types";

interface FollowListModalProps {
  userId: string;
  mode: "followers" | "following";
  onClose: () => void;
}

const PAGE_SIZE = 20;

export function FollowListModal({
  userId,
  mode,
  onClose,
}: FollowListModalProps): React.JSX.Element {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitial, setIsInitial] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const endpoint = `/users/${userId}/${mode}`;

  // ── Fetch page ──────────────────────────────────────────────────────────────
  const fetchPage = useCallback(
    async (pageNum: number): Promise<void> => {
      if (isLoading || !hasMore) return;
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await apiClient.get<{ users: FollowUser[]; hasMore: boolean }>(
          endpoint,
          { params: { page: pageNum, limit: PAGE_SIZE } },
        );
        setUsers((prev) =>
          pageNum === 1 ? data.users : [...prev, ...data.users],
        );
        setHasMore(data.hasMore);
        setPage(pageNum + 1);
      } catch {
        setError("Failed to load users.");
      } finally {
        setIsLoading(false);
        setIsInitial(false);
      }
    },
    [endpoint, hasMore, isLoading],
  );

  // Initial fetch
  useEffect(() => {
    void fetchPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, mode]);

  // Infinite scroll — IntersectionObserver on sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading) {
          void fetchPage(page);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchPage, hasMore, isLoading, page]);

  // Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const title = mode === "followers" ? "Followers" : "Following";

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        ref={overlayRef}
        onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex w-full max-w-sm flex-col rounded-2xl bg-white shadow-xl"
          style={{ maxHeight: "80vh" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 shrink-0">
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-3 py-2">
            {/* Initial skeleton */}
            {isInitial && (
              <div className="flex flex-col gap-3 py-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </div>
            )}

            {/* Error */}
            {error && !isInitial && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="text-3xl">⚠️</span>
                <p className="mt-2 text-sm text-gray-500">{error}</p>
                <button
                  onClick={() => fetchPage(1)}
                  className="mt-3 text-sm font-medium text-blue-600 hover:underline"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Empty state */}
            {!isInitial && !error && users.length === 0 && (
              <EmptyState mode={mode} />
            )}

            {/* User list */}
            {!isInitial && users.length > 0 && (
              <div className="flex flex-col divide-y divide-gray-50">
                {users.map((u) => (
                  <UserListItem key={u.id} user={u} />
                ))}
              </div>
            )}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-1" />

            {/* Loading more spinner */}
            {isLoading && !isInitial && (
              <div className="flex justify-center py-4">
                <Spinner size="sm" />
              </div>
            )}

            {/* End of list */}
            {!hasMore && users.length > 0 && (
              <p className="py-4 text-center text-xs text-gray-400">
                All {title.toLowerCase()} loaded.
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── User list item ───────────────────────────────────────────────────────────

function UserListItem({ user }: { user: FollowUser }): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-3 px-2 py-3">
      <div className="flex items-center gap-3 min-w-0">
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={user.displayName}
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
            {user.displayName[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">
            {user.displayName}
          </p>
          <p className="truncate text-xs text-gray-500">@{user.username}</p>
        </div>
      </div>
      <FollowButton
        userId={user.id}
        initialIsFollowing={user.isFollowing}
        size="sm"
      />
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ mode }: { mode: "followers" | "following" }): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <span className="text-4xl">
        {mode === "followers" ? "👥" : "🔍"}
      </span>
      <p className="mt-3 text-sm font-semibold text-gray-900">
        {mode === "followers" ? "No followers yet" : "Not following anyone"}
      </p>
      <p className="mt-1 text-xs text-gray-500 max-w-[200px]">
        {mode === "followers"
          ? "Share your notes and sessions to attract followers."
          : "Find communities and users to follow."}
      </p>
    </div>
  );
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow(): React.JSX.Element {
  return (
    <div className="flex items-center justify-between px-2 py-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-200" />
        <div className="flex flex-col gap-1.5">
          <div className="h-3 w-28 rounded-full bg-gray-200" />
          <div className="h-2.5 w-20 rounded-full bg-gray-100" />
        </div>
      </div>
      <div className="h-7 w-16 rounded-xl bg-gray-200" />
    </div>
  );
}
