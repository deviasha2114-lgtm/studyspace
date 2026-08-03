// apps/api/src/routes/follow-list.routes.js
// Sprint 7 — Followers / Following list endpoints
// Mounts at: /api/users/:userId  (extend existing users router)
// Add these two routes to your existing users.routes.js

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });
const prisma = new PrismaClient();

const PAGE_SIZE = 20;

// ─────────────────────────────────────────────────────────────────────────────
// Shared helper — enrich a list of users with isFollowing for the viewer
// ─────────────────────────────────────────────────────────────────────────────
async function enrichWithFollowStatus(users, viewerId) {
  if (!viewerId || users.length === 0) {
    return users.map((u) => ({ ...u, isFollowing: false }));
  }

  const ids = users.map((u) => u.id);
  const existing = await prisma.follows.findMany({
    where: { followerId: viewerId, followingId: { in: ids } },
    select: { followingId: true },
  });
  const followingSet = new Set(existing.map((f) => f.followingId));

  return users.map((u) => ({ ...u, isFollowing: followingSet.has(u.id) }));
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/users/:userId/followers
// Query: ?cursor=<cuid>
// ─────────────────────────────────────────────────────────────────────────────
router.get("/followers", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { cursor } = req.query;
    const viewerId = req.user?.id;

    const cursorClause = cursor
      ? { cursor: { followerId_followingId: { followerId: cursor, followingId: userId } }, skip: 1 }
      : {};

    const follows = await prisma.follows.findMany({
      where: { followingId: userId },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE + 1,
      ...cursorClause,
      include: {
        follower: {
          select: { id: true, name: true, username: true, image: true, bio: true },
        },
      },
    });

    const total = await prisma.follows.count({ where: { followingId: userId } });
    const hasMore = follows.length > PAGE_SIZE;
    const items = hasMore ? follows.slice(0, PAGE_SIZE) : follows;
    const users = items.map((f) => f.follower);
    const enriched = await enrichWithFollowStatus(users, viewerId);
    const nextCursor = hasMore ? items[items.length - 1].followerId : undefined;

    return res.json({ users: enriched, total, hasMore, cursor: nextCursor });
  } catch (err) {
    console.error("[GET /followers]", err);
    return res.status(500).json({ error: "Failed to fetch followers" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/users/:userId/following
// Query: ?cursor=<cuid>
// ─────────────────────────────────────────────────────────────────────────────
router.get("/following", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { cursor } = req.query;
    const viewerId = req.user?.id;

    const cursorClause = cursor
      ? { cursor: { followerId_followingId: { followerId: userId, followingId: cursor } }, skip: 1 }
      : {};

    const follows = await prisma.follows.findMany({
      where: { followerId: userId },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE + 1,
      ...cursorClause,
      include: {
        following: {
          select: { id: true, name: true, username: true, image: true, bio: true },
        },
      },
    });

    const total = await prisma.follows.count({ where: { followerId: userId } });
    const hasMore = follows.length > PAGE_SIZE;
    const items = hasMore ? follows.slice(0, PAGE_SIZE) : follows;
    const users = items.map((f) => f.following);
    const enriched = await enrichWithFollowStatus(users, viewerId);
    const nextCursor = hasMore ? items[items.length - 1].followingId : undefined;

    return res.json({ users: enriched, total, hasMore, cursor: nextCursor });
  } catch (err) {
    console.error("[GET /following]", err);
    return res.status(500).json({ error: "Failed to fetch following" });
  }
});

module.exports = router;
