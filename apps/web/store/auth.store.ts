import { create } from "zustand";
import type { UserRole } from "@/types/next-auth";
import type { Stream, ClassName } from "@/components/profile/profile.types";

// ─── AuthUser ────────────────────────────────────────────────────────────────
// Extended with profile fields added in FE-S2-06.
// avatarUrl is the Cloudinary-hosted URL (separate from NextAuth session.image,
// which is the OAuth provider avatar). After a user uploads a custom avatar,
// avatarUrl takes precedence in UI rendering.
export interface AuthUser {
  id: string;
  name: string | null;        // NextAuth displayName (OAuth)
  email: string | null;
  image: string | null;       // OAuth provider avatar (Google / GitHub)
  // ── Profile fields (FE-S2-06) ──
  displayName: string | null; // User-set display name (overrides name in UI)
  username: string | null;    // @handle
  avatarUrl: string | null;   // Cloudinary custom avatar (overrides image)
  bio: string | null;
  stream: Stream | null;
  className: ClassName | null;
  joinedAt: string | null;    // ISO timestamp
}

// ─── Profile update payload ───────────────────────────────────────────────────
export interface ProfileUpdatePayload {
  displayName?: string;
  bio?: string;
  stream?: Stream;
  className?: ClassName;
}

// ─── Store interface ──────────────────────────────────────────────────────────
interface AuthState {
  user: AuthUser | null;
  role: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Existing actions
  setUser: (user: AuthUser | null, role: UserRole | null) => void;
  setLoading: (isLoading: boolean) => void;
  clear: () => void;

  // FE-S2-06: new profile actions
  updateProfile: (payload: ProfileUpdatePayload) => void;
  updateAvatar: (avatarUrl: string) => void;
}

// ─── Default user shell ───────────────────────────────────────────────────────
function defaultProfileFields(): Pick<
  AuthUser,
  | "displayName"
  | "username"
  | "avatarUrl"
  | "bio"
  | "stream"
  | "className"
  | "joinedAt"
> {
  return {
    displayName: null,
    username: null,
    avatarUrl: null,
    bio: null,
    stream: null,
    className: null,
    joinedAt: null,
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────
/**
 * Client-side mirror of the authenticated user's state.
 *
 * Sources of truth:
 *  - id, name, email, image, role  → NextAuth session (synced by useAuth)
 *  - displayName, username, bio,
 *    stream, className, avatarUrl  → Backend /users/me (fetched post-login)
 *
 * FE-S2-06 additions:
 *  - updateProfile()  → called after PATCH /users/me succeeds
 *  - updateAvatar()   → called after POST /users/me/avatar succeeds
 *
 * NOTE FOR ARCHITECT:
 * updateProfile() and updateAvatar() update local state ONLY — they do not
 * make API calls. The API calls live in the form/upload components
 * (FE-S2-02, FE-S2-03). This keeps the store as a pure state container.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  role: null,
  isLoading: true,
  isAuthenticated: false,

  // ── Existing ──────────────────────────────────────────────────────────────

  setUser: (user, role) =>
    set({
      user: user
        ? { ...defaultProfileFields(), ...user }
        : null,
      role,
      isAuthenticated: Boolean(user),
      isLoading: false,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  clear: () =>
    set({
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  // ── FE-S2-06: updateProfile ───────────────────────────────────────────────
  // Merges PATCH /users/me response fields into the current user.
  // Safe to call even when user is null (no-op guard).
  updateProfile: (payload: ProfileUpdatePayload) => {
    const current = get().user;
    if (!current) return;
    set({
      user: {
        ...current,
        ...(payload.displayName !== undefined && {
          displayName: payload.displayName,
        }),
        ...(payload.bio !== undefined && { bio: payload.bio }),
        ...(payload.stream !== undefined && { stream: payload.stream }),
        ...(payload.className !== undefined && {
          className: payload.className,
        }),
      },
    });
  },

  // ── FE-S2-06: updateAvatar ────────────────────────────────────────────────
  // Called after Cloudinary upload succeeds via POST /users/me/avatar.
  // Sets avatarUrl (custom) — does NOT overwrite image (OAuth).
  updateAvatar: (avatarUrl: string) => {
    const current = get().user;
    if (!current) return;
    set({ user: { ...current, avatarUrl } });
  },
}));
