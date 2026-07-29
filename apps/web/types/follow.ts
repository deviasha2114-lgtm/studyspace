// types/follow.ts
// Shared types for FollowListModal (Sprint 7)

export type FollowTab = "followers" | "following";

export interface FollowUser {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  bio: string | null;
  /** Whether the currently-authenticated user follows this person */
  isFollowing: boolean;
}

export interface FollowListResponse {
  users: FollowUser[];
  total: number;
  hasMore: boolean;
  cursor?: string;
}
