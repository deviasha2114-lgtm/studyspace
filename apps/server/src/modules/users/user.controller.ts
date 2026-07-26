// src/controllers/user.controller.ts
// StudySpace — User Controller
//
// Wired to:
//   user.service.ts      → all profile / follow logic
//   cloudinary.service.ts → avatar upload
//
// Routes (defined in user.routes.ts):
//   GET    /users/:username              → getProfile
//   PATCH  /users/me                     → updateMe
//   POST   /users/:username/follow       → followUser
//   DELETE /users/:username/follow       → unfollowUser
//   GET    /users/:username/followers    → listFollowers
//   GET    /users/:username/following    → listFollowing
//   POST   /users/me/avatar              → uploadAvatar

import { Request, Response, NextFunction } from 'express';
import * as UserService from '@/services/user.service';
import { uploadBuffer } from '@/services/cloudinary.service';
import { AppError } from '@/errors/AppError';

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Safely parse ?page= query param — defaults to 1, min 1. */
function parsePage(query: unknown): number {
  const n = parseInt(String(query), 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

// ── GET /users/:username ───────────────────────────────────────────────────────
/**
 * Public profile endpoint.
 * Returns displayName, bio, avatarUrl, note/follower/following counts.
 * Email is NEVER in the response — enforced at the service layer.
 */
export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { username } = req.params;
    const viewerUserId = req.user?.id;   // undefined for unauthenticated requests

    const profile = await UserService.findByUsername(username, viewerUserId);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
}

// ── PATCH /users/me ────────────────────────────────────────────────────────────
/**
 * Authenticated user updates their own profile.
 * Accepted body fields: displayName, bio
 * (avatarUrl is set separately via POST /users/me/avatar)
 */
export async function updateMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;           // auth middleware guarantees this
    const { displayName, bio } = req.body;

    const updated = await UserService.updateProfile(userId, {
      displayName,
      bio,
    });

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

// ── POST /users/me/avatar ──────────────────────────────────────────────────────
/**
 * Uploads an avatar image for the authenticated user.
 * Expects multipart/form-data with field name "avatar".
 * multer middleware (memoryStorage) must run before this controller.
 *
 * Flow:
 *   1. Validate file is present and is an image
 *   2. uploadBuffer() → Cloudinary (400×400, webp, crop:fill)
 *   3. updateProfile() → store secureUrl in DB
 *   4. Return updated profile
 */
export async function uploadAvatar(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;

    // Validate upload exists
    if (!req.file) {
      throw new AppError(400, 'No file uploaded. Send an image as field "avatar".');
    }

    // Guard: only allow image MIME types
    if (!req.file.mimetype.startsWith('image/')) {
      throw new AppError(400, `Invalid file type "${req.file.mimetype}". Images only.`);
    }

    // Upload to Cloudinary — stable publicId per user = automatic overwrite
    const uploadResult = await uploadBuffer(req.file.buffer, {
      publicId: `avatar_${userId}`,
      tags: ['avatar', userId],
    });

    // Persist the new URL
    const updated = await UserService.updateProfile(userId, {
      avatarUrl: uploadResult.secureUrl,
    });

    res.status(200).json({
      success: true,
      data: {
        avatarUrl: uploadResult.secureUrl,
        profile: updated,
        _upload: {
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
          bytes: uploadResult.bytes,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── POST /users/:username/follow ───────────────────────────────────────────────
/**
 * Authenticated user follows @username.
 * 400 if already following or self-follow.
 * 404 if target doesn't exist.
 * Triggers a NEW_FOLLOWER notification (handled inside service transaction).
 */
export async function followUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const followerId = req.user!.id;
    const { username } = req.params;

    // Resolve username → id (service handles 404)
    const target = await UserService.findByUsername(username);

    await UserService.follow(followerId, target.id);

    res.status(200).json({
      success: true,
      message: `You are now following @${username}`,
    });
  } catch (err) {
    next(err);
  }
}

// ── DELETE /users/:username/follow ─────────────────────────────────────────────
/**
 * Authenticated user unfollows @username.
 * Idempotent — succeeds even if not currently following.
 */
export async function unfollowUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const followerId = req.user!.id;
    const { username } = req.params;

    const target = await UserService.findByUsername(username);

    await UserService.unfollow(followerId, target.id);

    res.status(200).json({
      success: true,
      message: `You have unfollowed @${username}`,
    });
  } catch (err) {
    next(err);
  }
}

// ── GET /users/:username/followers ─────────────────────────────────────────────
/**
 * Paginated list of users who follow @username.
 * Each entry has isFollowing flag relative to the authenticated viewer.
 *
 * Query params:
 *   ?page=1   (default: 1)
 */
export async function listFollowers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { username } = req.params;
    const page = parsePage(req.query.page);
    const viewerUserId = req.user?.id;

    const result = await UserService.getFollowers(username, page, viewerUserId);

    res.status(200).json({
      success: true,
      data: result.users,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        hasNextPage: result.hasNextPage,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── GET /users/:username/following ─────────────────────────────────────────────
/**
 * Paginated list of users that @username follows.
 * Each entry has isFollowing flag relative to the authenticated viewer.
 *
 * Query params:
 *   ?page=1   (default: 1)
 */
export async function listFollowing(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { username } = req.params;
    const page = parsePage(req.query.page);
    const viewerUserId = req.user?.id;

    const result = await UserService.getFollowing(username, page, viewerUserId);

    res.status(200).json({
      success: true,
      data: result.users,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        hasNextPage: result.hasNextPage,
      },
    });
  } catch (err) {
    next(err);
  }
}
