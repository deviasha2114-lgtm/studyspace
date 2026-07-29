// components/modals/FollowListModal.tsx
// Sprint 7 — Followers / Following modal
//
// Usage:
//   <FollowListModal
//     isOpen={open}
//     onClose={() => setOpen(false)}
//     userId={profile.id}
//     defaultTab="followers"
//     followerCount={profile._count.followers}
//     followingCount={profile._count.following}
//   />

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, UserCheck, UserPlus, Loader2, Users } from "lucide-react";
import { useFollowList } from "@/hooks/useFollowList";
import type { FollowTab, FollowUser } from "@/types/follow";
import axios from "@/lib/axios";
import { cn } from "@/lib/utils";

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  defaultTab?: FollowTab;
  followerCount?: number;
  followingCount?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// User row
// ─────────────────────────────────────────────────────────────────────────────
function UserRow({
  user,
  onToggleFollow,
  onClose,
}: {
  user: FollowUser;
  onToggleFollow: (id: string) => void;
  onClose: () => void;
}) {
  const handleFollow = async () => {
    onToggleFollow(user.id); // optimistic
    try {
      await axios.post(
        `/users/${user.id}/${user.isFollowing ? "unfollow" : "follow"}`
      );
    } catch {
      onToggleFollow(user.id); // revert on error
    }
  };

  const profileHref = `/dashboard/profile/${user.username ?? user.id}`;

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <Link href={profileHref} onClick={onClose} className="shrink-0">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name ?? "User"}
            width={40}
            height={40}
            className="rounded-full object-cover w-10 h-10"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-semibold text-sm select-none">
            {(user.name ?? user.username ?? "?")[0].toUpperCase()}
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <Link
          href={profileHref}
          onClick={onClose}
          className="block text-sm font-medium text-gray-900 dark:text-white hover:underline truncate"
        >
          {user.name ?? user.username ?? "Unknown"}
        </Link>
        {user.username && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            @{user.username}
          </p>
        )}
        {user.bio && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
            {user.bio}
          </p>
        )}
      </div>

      <button
        onClick={handleFollow}
        className={cn(
          "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
          user.isFollowing
            ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
            : "bg-indigo-600 text-white hover:bg-indigo-700"
        )}
        aria-label={user.isFollowing ? `Unfollow ${user.name}` : `Follow ${user.name}`}
      >
        {user.isFollowing ? (
          <><UserCheck className="w-3 h-3" />Following</>
        ) : (
          <><UserPlus className="w-3 h-3" />Follow</>
        )}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main modal
// ─────────────────────────────────────────────────────────────────────────────
export function FollowListModal({
  isOpen,
  onClose,
  userId,
  defaultTab = "followers",
  followerCount,
  followingCount,
}: FollowListModalProps) {
  const [activeTab, setActiveTab] = useState<FollowTab>(defaultTab);

  useEffect(() => {
    if (isOpen) setActiveTab(defaultTab);
  }, [isOpen, defaultTab]);

  const { users, total, loading, loadingMore, hasMore, error, loadMore, toggleFollow } =
    useFollowList(userId, activeTab);

  const listRef = useRef<HTMLDivElement>(null);
  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) loadMore();
  }, [loadMore, hasMore]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={activeTab === "followers" ? "Followers list" : "Following list"}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-0">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white capitalize">
            {activeTab}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mt-3 px-4">
          {(["followers", "following"] as FollowTab[]).map((t) => {
            const count = t === "followers" ? followerCount : followingCount;
            return (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={cn(
                  "pb-2 mr-6 text-sm font-medium border-b-2 transition-colors capitalize",
                  activeTab === t
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                )}
              >
                {t}
                {count !== undefined && (
                  <span className="ml-1.5 text-xs text-gray-400">({count.toLocaleString()})</span>
                )}
              </button>
            );
          })}
        </div>

        {/* List */}
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto overscroll-contain divide-y divide-gray-100 dark:divide-gray-800"
        >
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
            </div>
          )}
          {!loading && error && (
            <p className="text-sm text-red-500 text-center py-12 px-6">{error}</p>
          )}
          {!loading && !error && users.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Users className="w-8 h-8 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {activeTab === "followers" ? "No followers yet." : "Not following anyone yet."}
              </p>
            </div>
          )}
          {!loading && users.map((user) => (
            <UserRow key={user.id} user={user} onToggleFollow={toggleFollow} onClose={onClose} />
          ))}
          {loadingMore && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && total > 0 && (
          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-400 text-center">
              {users.length.toLocaleString()} of {total.toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
