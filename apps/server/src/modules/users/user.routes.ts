/**
 * SEC-S2-04 — Profile API Security Review
 *
 * Security guarantees enforced at the routing layer:
 *  - GET /users/:username   → email NEVER included in response (sanitizePublicProfile)
 *  - PATCH /users/me        → auth middleware ensures only own profile is editable
 *  - Follow endpoints       → auth required + followLimiter (30/min per user)
 *  - Avatar upload          → avatarUploadMiddleware (size, type, magic bytes, filename)
 */

import { Router, Request, Response, NextFunction } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { followLimiter } from "../config/rateLimiter";
import { avatarUploadMiddleware } from "../middleware/avatarUpload.middleware";
import { validate } from "../middleware/validate.middleware";
import { UpdateProfileSchema } from "../schemas/user.schema";
import * as UserController from "../controllers/user.controller";

const router = Router();

// ---------------------------------------------------------------------------
// Helper: strip fields that must never leave the server
// Call this before every public profile response.
// ---------------------------------------------------------------------------
export function sanitizePublicProfile(user: Record<string, unknown>) {
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    email,          // ← NEVER exposed (SEC-S2-04)
    password,       // ← defensive: never expose hash either
    refreshToken,
    resetToken,
    __v,
    ...publicFields
  } = user;

  return publicFields;
}

// ---------------------------------------------------------------------------
// Public routes
// ---------------------------------------------------------------------------

/**
 * GET /users/:username
 * Public profile — email is stripped via sanitizePublicProfile in the controller.
 */
router.get("/:username", UserController.getPublicProfile);

// ---------------------------------------------------------------------------
// Authenticated routes
// ---------------------------------------------------------------------------

/**
 * PATCH /users/me
 * Update own profile. Auth middleware sets req.user; controller uses req.user.id,
 * so a user can only ever edit their own document.
 */
router.patch(
  "/me",
  authenticate,
  validate(UpdateProfileSchema),
  UserController.updateProfile
);

/**
 * PATCH /users/me/avatar
 * Upload / replace profile avatar.
 * Security: size, MIME type, magic bytes, filename sanitization — all in middleware.
 */
router.patch(
  "/me/avatar",
  authenticate,
  avatarUploadMiddleware,
  UserController.updateAvatar
);

// ---------------------------------------------------------------------------
// Follow / Unfollow endpoints (SEC-S2-02 + SEC-S2-04)
// Auth required + rate limited to 30 actions/min per user
// ---------------------------------------------------------------------------

/**
 * POST /users/:username/follow
 */
router.post(
  "/:username/follow",
  authenticate,
  followLimiter,
  UserController.followUser
);

/**
 * DELETE /users/:username/follow
 */
router.delete(
  "/:username/follow",
  authenticate,
  followLimiter,
  UserController.unfollowUser
);

/**
 * GET /users/:username/followers  — auth required (privacy)
 */
router.get("/:username/followers", authenticate, UserController.getFollowers);

/**
 * GET /users/:username/following  — auth required (privacy)
 */
router.get("/:username/following", authenticate, UserController.getFollowing);

export default router;
