import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

// ---------------------------------------------------------------------------
// Shared response helper
// ---------------------------------------------------------------------------
const rateLimitHandler = (message: string) =>
  (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message,
      },
    });
  };

// ---------------------------------------------------------------------------
// General API limiter (existing — kept for reference)
// ---------------------------------------------------------------------------
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler(
    "Too many requests. Please try again after 15 minutes."
  ),
});

// ---------------------------------------------------------------------------
// SEC-S2-02: Follow limiter
// 30 follow / unfollow actions per user per minute
// Keyed by authenticated user ID (falls back to IP for unauthenticated hits,
// though follow endpoints require auth — see SEC-S2-04).
// ---------------------------------------------------------------------------
export const followLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,             // 30 actions per window
  standardHeaders: true,
  legacyHeaders: false,

  // Key by user ID extracted from JWT, not raw IP — prevents IP-rotation abuse
  keyGenerator: (req: Request): string => {
    // req.user is populated by your auth middleware
    const userId = (req as any).user?.id;
    if (userId) return `follow:user:${userId}`;
    // Fallback to IP (should never reach here if auth middleware runs first)
    return `follow:ip:${req.ip}`;
  },

  handler: rateLimitHandler(
    "You are following too quickly. Please slow down and try again in a minute."
  ),

  // Skip counting on errors so a bad request doesn't eat the quota
  skipFailedRequests: true,
});

// ---------------------------------------------------------------------------
// Auth / login limiter (existing — kept for reference)
// ---------------------------------------------------------------------------
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler(
    "Too many login attempts. Please try again after 15 minutes."
  ),
});
