// apps/api/src/routes/notifications.routes.js
// Sprint 7 — Notifications REST API
// Mounts at: /api/notifications

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

const PAGE_SIZE = 20;

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/notifications
// Returns paginated notifications for the authenticated user.
// Query: ?cursor=<cuid>&unreadOnly=true
// ─────────────────────────────────────────────────────────────────────────────
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { cursor, unreadOnly } = req.query;

    const where = {
      recipientId: userId,
      ...(unreadOnly === "true" ? { read: false } : {}),
      ...(cursor ? { createdAt: { lt: (await prisma.notification.findUnique({ where: { id: cursor } }))?.createdAt } } : {}),
    };

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: PAGE_SIZE + 1,
        include: {
          actor: {
            select: { id: true, name: true, username: true, image: true },
          },
        },
      }),
      prisma.notification.count({
        where: { recipientId: userId, read: false },
      }),
    ]);

    const hasMore = notifications.length > PAGE_SIZE;
    const items = hasMore ? notifications.slice(0, PAGE_SIZE) : notifications;
    const nextCursor = hasMore ? items[items.length - 1].id : undefined;

    return res.json({
      notifications: items,
      unreadCount,
      hasMore,
      cursor: nextCursor,
    });
  } catch (err) {
    console.error("[GET /notifications]", err);
    return res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/notifications/unread-count
// Lightweight poll endpoint — only returns unread count.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/unread-count", authenticateToken, async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: { recipientId: req.user.id, read: false },
    });
    return res.json({ unreadCount: count });
  } catch (err) {
    console.error("[GET /notifications/unread-count]", err);
    return res.status(500).json({ error: "Failed to fetch unread count" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/notifications/read
// Mark notifications as read. Body: { ids?: string[] }
// Omit `ids` to mark ALL as read.
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/read", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { ids } = req.body;

    const where = {
      recipientId: userId,
      read: false,
      ...(Array.isArray(ids) && ids.length > 0 ? { id: { in: ids } } : {}),
    };

    const { count } = await prisma.notification.updateMany({
      where,
      data: { read: true },
    });

    const unreadCount = await prisma.notification.count({
      where: { recipientId: userId, read: false },
    });

    return res.json({ updated: count, unreadCount });
  } catch (err) {
    console.error("[PATCH /notifications/read]", err);
    return res.status(500).json({ error: "Failed to mark notifications as read" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/notifications/:id
// Delete a single notification (must belong to the authed user).
// ─────────────────────────────────────────────────────────────────────────────
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.recipientId !== req.user.id) {
      return res.status(404).json({ error: "Notification not found" });
    }

    await prisma.notification.delete({ where: { id } });
    return res.json({ success: true });
  } catch (err) {
    console.error("[DELETE /notifications/:id]", err);
    return res.status(500).json({ error: "Failed to delete notification" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Notification factory — call from other routes (follow, like, comment, etc.)
// Usage: createNotification(prisma, { recipientId, actorId, type, entityId, entityType, message })
// ─────────────────────────────────────────────────────────────────────────────
async function createNotification(prismaClient, {
  recipientId,
  actorId = null,
  type,
  entityId = null,
  entityType = null,
  message,
}) {
  // Never notify yourself
  if (recipientId === actorId) return null;

  return prismaClient.notification.create({
    data: { recipientId, actorId, type, entityId, entityType, message },
  });
}

module.exports = router;
module.exports.createNotification = createNotification;
