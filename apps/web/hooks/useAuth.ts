"use client";

import { useEffect } from "react";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import {
  useAuthStore,
  type AuthUser,
  type ProfileUpdatePayload,
} from "@/store/auth.store";
import type { UserRole } from "@/types/next-auth";

interface UseAuthResult {
  user: AuthUser | null;
  role: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: (callbackUrl?: string) => Promise<void>;
  // FE-S2-06: profile mutation helpers (thin wrappers around store actions)
  updateProfile: (payload: ProfileUpdatePayload) => void;
  updateAvatar: (avatarUrl: string) => void;
}

export function useAuth(): UseAuthResult {
  const { data: session, status } = useSession();
  const {
    user,
    role,
    isLoading,
    isAuthenticated,
    setUser,
    setLoading,
    updateProfile,
    updateAvatar,
  } = useAuthStore();

  useEffect(() => {
    if (status === "loading") {
      setLoading(true);
      return;
    }

    if (status === "authenticated" && session?.user) {
      // Preserve any profile fields already in the store (e.g. fetched from
      // Backend after login) — only overwrite the NextAuth-sourced fields.
      const existing = useAuthStore.getState().user;
      setUser(
        {
          // Profile fields — keep existing store values if already populated
          displayName: existing?.displayName ?? null,
          username: existing?.username ?? null,
          avatarUrl: existing?.avatarUrl ?? null,
          bio: existing?.bio ?? null,
          stream: existing?.stream ?? null,
          className: existing?.className ?? null,
          joinedAt: existing?.joinedAt ?? null,
          // NextAuth-sourced fields
          id: session.user.id,
          name: session.user.name ?? null,
          email: session.user.email ?? null,
          image: session.user.image ?? null,
        },
        session.user.role,
      );
      return;
    }

    setUser(null, null);
  }, [session, status, setUser, setLoading]);

  async function signOut(callbackUrl = "/login"): Promise<void> {
    useAuthStore.getState().clear();
    await nextAuthSignOut({ callbackUrl });
  }

  return {
    user,
    role,
    isLoading,
    isAuthenticated,
    signOut,
    updateProfile,
    updateAvatar,
  };
}
