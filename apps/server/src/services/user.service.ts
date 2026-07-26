// src/services/user.service.ts
// StudySpace — User Service
//
// All DB access goes through Prisma. Email is NEVER returned in public-facing
// queries — enforced via explicit `select` / field exclusion on every query.
//
// Methods:
//   findByUsername(username)               → public profile + stats
//   updateProfile(userId, data)            → PATCH allowed fields
//   follow(followerId, targetId)           → create Follow + notification
//   unfollow(followerId, targetId)         → delete Follow record
//   getFollowers(username, page)           → paginated + isFollowing flag
//   getFollowing(username, page)           → paginated + isFollowing flag

import { Prisma, PrismaClient } from '@prisma/client';
import { AppError } from '@/errors/AppError';

const prisma = new PrismaClient();

// ── Constants ──────────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;

// ── Shared public-profile select ───────────────────────────────────────────────
// One place to maintain the fields we expose. Email is intentionally absent.
const PUBLIC_USER_SELECT = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
  bio: true,
  createdAt: true,
  // email: false  ← never included — not even for logged-in viewers
} as const satisfies Prisma.UserSelect;

// ── Types ──────────────────────────────────────────────────────────────────────
export interface PublicProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: Date;
  _count: {
    notes: number;
    followers: number;
    following: number;
  };
}

export interface UpdateProfileData {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface PaginatedUsers {
  users: (PublicProfile & { isFollowing: boolean })[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

// ── 1. findByUsername ──────────────────────────────────────────────────────────
/**
 * Returns a public profile with note / follower / following counts.
 * Email is NEVER returned — enforced by explicit select.
 *
 * @param username       The target user's unique username
 * @param viewerUserId   Optional — used only for future isFollowing flag (not here)
 * @throws AppError 404  if the username does not exist
 */
export async function findByUsername(
  username: string,
  viewerUserId?: string
): Promise<PublicProfile> {
  // DB Engineer query pattern: single query, _count via Prisma relation aggregation
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      ...PUBLIC_USER_SELECT,
      _count: {
        select: {
          notes: true,       // notes authored by this user
          followers: true,   // Follow records where targetId = user.id
          following: true,   // Follow records where followerId = user.id
        },
      },
    },
  });

  if (!user) {
    throw new AppError(404, `User @${username} not found`);
  }

  return user;
}

// ── 2. updateProfile ───────────────────────────────────────────────────────────
/**
 * PATCHes allowed profile fields for the authenticated user.
 * Only fields present in UpdateProfileData can be changed — schema fields like
 * role, email, emailVerified are not touchable here.
 *
 * @param userId  Authenticated user's id (from JWT sub)
 * @param data    Partial set of patchable fields
 * @returns       Updated public profile (no email)
 * @throws AppError 404  if userId doesn't exist (shouldn't happen mid-session)
 */
export async function updateProfile(
  userId: string,
  data: UpdateProfileData
): Promise<PublicProfile> {
  // Guard: reject empty patches early — nothing to do
  if (Object.keys(data).length === 0) {
    throw new AppError(400, 'No fields provided to update');
  }

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.displayName !== undefined && { displayName: data.displayName }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
      },
      select: {
        ...PUBLIC_USER_SELECT,
        _count: {
          select: {
            notes: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    return updated;
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2025'
    ) {
      throw new AppError(404, 'User not found');
    }
    throw err;
  }
}

// ── 3. follow ─────────────────────────────────────────────────────────────────
/**
 * Creates a Follow record from follower → target.
 *
 * Guards:
 *   - Self-follow → 400
 *   - Already following → 400
 *   - Target user doesn't exist → 404
 *
 * Side-effect: creates a Notification for the target user.
 *
 * @param followerId  The user who is clicking "Follow"
 * @param targetId    The user being followed
 */
export async function follow(
  followerId: string,
  targetId: string
): Promise<void> {
  // Guard 1 — can't follow yourself
  if (followerId === targetId) {
    throw new AppError(400, 'You cannot follow yourself');
  }

  // Guard 2 — target must exist
  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true },
  });
  if (!target) {
    throw new AppError(404, 'User to follow not found');
  }

  // Guard 3 — already following?
  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId: targetId,
      },
    },
  });
  if (existing) {
    throw new AppError(400, 'You are already following this user');
  }

  // Create Follow record + Notification in a single transaction
  await prisma.$transaction([
    prisma.follow.create({
      data: {
        followerId,
        followingId: targetId,
      },
    }),
    prisma.notification.create({
      data: {
        userId: targetId,           // notify the person being followed
        type: 'FOLLOW',
        entityId: followerId,    // so the UI can link to the follower's profile
      },
    }),
  ]);
}

// ── 4. unfollow ───────────────────────────────────────────────────────────────
/**
 * Deletes the Follow record between follower and target.
 * Silently succeeds if the record doesn't exist (idempotent).
 *
 * @param followerId  The user who wants to unfollow
 * @param targetId    The user being unfollowed
 */
export async function unfollow(
  followerId: string,
  targetId: string
): Promise<void> {
  // Self-unfollow guard — keeps the data model consistent
  if (followerId === targetId) {
    throw new AppError(400, 'You cannot unfollow yourself');
  }

  try {
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId: targetId,
        },
      },
    });
  } catch (err) {
    // P2025 = record not found — unfollow is idempotent, swallow this
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2025'
    ) {
      return;
    }
    throw err;
  }
}

// ── 5. getFollowers ────────────────────────────────────────────────────────────
/**
 * Returns a paginated list of users who follow @username.
 * Each result includes an `isFollowing` flag (does the viewer follow them back?).
 *
 * @param username      Target user's username
 * @param page          1-indexed page number (default: 1)
 * @param viewerUserId  Logged-in user's id — used to compute isFollowing
 * @throws AppError 404 if username doesn't exist
 */
export async function getFollowers(
  username: string,
  page: number = 1,
  viewerUserId?: string
): Promise<PaginatedUsers> {
  const target = await _requireUserByUsername(username);

  const skip = (page - 1) * PAGE_SIZE;

  const [followRecords, total] = await Promise.all([
    prisma.follow.findMany({
      where: { followingId: target.id },
      skip,
      take: PAGE_SIZE,
      orderBy: { createdAt: 'desc' },
      select: {
        // Follower's public profile — DB Engineer pattern: select inside relation
        follower: {
          select: {
            ...PUBLIC_USER_SELECT,
            _count: {
              select: {
                notes: true,
                followers: true,
                following: true,
              },
            },
          },
        },
      },
    }),
    prisma.follow.count({ where: { followingId: target.id } }),
  ]);

  // Build isFollowing flags in one query (viewer → each follower)
  const followerIds = followRecords.map((r) => r.follower.id);
  const viewerFollowSet = await _getViewerFollowSet(viewerUserId, followerIds);

  const users = followRecords.map((r) => ({
    ...r.follower,
    isFollowing: viewerFollowSet.has(r.follower.id),
  }));

  return {
    users,
    total,
    page,
    pageSize: PAGE_SIZE,
    hasNextPage: skip + PAGE_SIZE < total,
  };
}

// ── 6. getFollowing ────────────────────────────────────────────────────────────
/**
 * Returns a paginated list of users that @username follows.
 * Each result includes an `isFollowing` flag (does the viewer follow them?).
 *
 * @param username      Target user's username
 * @param page          1-indexed page number (default: 1)
 * @param viewerUserId  Logged-in user's id — used to compute isFollowing
 * @throws AppError 404 if username doesn't exist
 */
export async function getFollowing(
  username: string,
  page: number = 1,
  viewerUserId?: string
): Promise<PaginatedUsers> {
  const target = await _requireUserByUsername(username);

  const skip = (page - 1) * PAGE_SIZE;

  const [followRecords, total] = await Promise.all([
    prisma.follow.findMany({
      where: { followerId: target.id },
      skip,
      take: PAGE_SIZE,
      orderBy: { createdAt: 'desc' },
      select: {
        // The person being followed
        following: {
          select: {
            ...PUBLIC_USER_SELECT,
            _count: {
              select: {
                notes: true,
                followers: true,
                following: true,
              },
            },
          },
        },
      },
    }),
    prisma.follow.count({ where: { followerId: target.id } }),
  ]);

  const followingIds = followRecords.map((r) => r.following.id);
  const viewerFollowSet = await _getViewerFollowSet(viewerUserId, followingIds);

  const users = followRecords.map((r) => ({
    ...r.following,
    isFollowing: viewerFollowSet.has(r.following.id),
  }));

  return {
    users,
    total,
    page,
    pageSize: PAGE_SIZE,
    hasNextPage: skip + PAGE_SIZE < total,
  };
}

// ── Private helpers ────────────────────────────────────────────────────────────

/** Fetch a user by username or throw 404. Returns only {id}. */
async function _requireUserByUsername(username: string): Promise<{ id: string }> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (!user) throw new AppError(404, `User @${username} not found`);
  return user;
}

/**
 * Given a viewer and a list of candidate user ids, returns a Set of ids
 * that the viewer is already following. One DB query regardless of list size.
 * Returns empty Set when viewerUserId is undefined (unauthenticated).
 */
async function _getViewerFollowSet(
  viewerUserId: string | undefined,
  candidateIds: string[]
): Promise<Set<string>> {
  if (!viewerUserId || candidateIds.length === 0) return new Set();

  const rows = await prisma.follow.findMany({
    where: {
      followerId: viewerUserId,
      followingId: { in: candidateIds },
    },
    select: { followingId: true },
  });

  return new Set(rows.map((r) => r.followingId));
}
