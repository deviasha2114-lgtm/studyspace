"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/axios";
import { useNotificationStore } from "@/store/notification.store";
import { Spinner } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { ApiErrorShape } from "@/lib/axios";

interface FollowButtonProps {
  userId: string;
  initialIsFollowing: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  size?: "sm" | "md";
}

export function FollowButton({
  userId,
  initialIsFollowing,
  onFollowChange,
  size = "md",
}: FollowButtonProps): React.JSX.Element {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const addNotification = useNotificationStore((s) => s.addNotification);

  async function handleToggle(): Promise<void> {
    if (isLoading) return;

    // Optimistic update
    const next = !isFollowing;
    setIsFollowing(next);
    onFollowChange?.(next);
    setIsLoading(true);

    try {
      if (next) {
        await apiClient.post(`/users/${userId}/follow`);
      } else {
        await apiClient.delete(`/users/${userId}/follow`);
      }
    } catch (err) {
      // Rollback on failure
      setIsFollowing(!next);
      onFollowChange?.(!next);

      const apiErr = err as ApiErrorShape;
      addNotification({
        type: "error",
        title: next ? "Couldn't follow" : "Couldn't unfollow",
        message: apiErr.message ?? "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const sizeClass = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2 text-sm",
  }[size];

  // Label: Following → hover shows Unfollow
  const label = isFollowing
    ? isHovering
      ? "Unfollow"
      : "Following ✓"
    : "Follow";

  const baseClass = cn(
    "relative inline-flex items-center justify-center gap-1.5 rounded-xl font-medium transition-all duration-150",
    sizeClass,
    isFollowing
      ? isHovering
        ? "border border-red-300 bg-red-50 text-red-600"
        : "border border-blue-200 bg-blue-50 text-blue-700"
      : "bg-blue-600 text-white hover:bg-blue-700",
    isLoading ? "opacity-70 cursor-not-allowed" : "cursor-pointer",
  );

  return (
    <motion.button
      onClick={handleToggle}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      disabled={isLoading}
      whileTap={{ scale: 0.97 }}
      className={baseClass}
      aria-label={isFollowing ? "Unfollow user" : "Follow user"}
    >
      {isLoading ? (
        <Spinner size="sm" />
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={label}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
          >
            {label}
          </motion.span>
        </AnimatePresence>
      )}
    </motion.button>
  );
}
