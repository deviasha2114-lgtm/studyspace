// lib/createNotification.js
// Sprint 7 — Central factory used by follow, like, comment, and community routes
// Keeps notification creation logic in one place and avoids circular imports.
//
// Import in any route file:
//   const { createNotification } = require("../../lib/createNotification");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * @param {{ recipientId: string, actorId?: string|null, type: string, entityId?: string|null, entityType?: string|null, message: string }} opts
 */
async function createNotification({
  recipientId,
  actorId = null,
  type,
  entityId = null,
  entityType = null,
  message,
}) {
  // Don't notify yourself
  if (recipientId === actorId) return null;

  return prisma.notification.create({
    data: { recipientId, actorId, type, entityId, entityType, message },
  });
}

module.exports = { createNotification };

// ─────────────────────────────────────────────────────────────────────────────
// Usage examples — paste these calls into the corresponding route files
// ─────────────────────────────────────────────────────────────────────────────

// In follow.routes.js  (after a successful follow):
// await createNotification({
//   recipientId: targetUser.id,
//   actorId:     req.user.id,
//   type:        "FOLLOW",
//   message:     "started following you",
// });

// In notes.routes.js  (after a like):
// await createNotification({
//   recipientId: note.authorId,
//   actorId:     req.user.id,
//   type:        "NOTE_LIKE",
//   entityId:    note.id,
//   entityType:  "note",
//   message:     `liked your note "${note.title}"`,
// });

// In comments.routes.js  (after a comment):
// await createNotification({
//   recipientId: note.authorId,
//   actorId:     req.user.id,
//   type:        "NOTE_COMMENT",
//   entityId:    note.id,
//   entityType:  "comment",
//   message:     `commented on your note "${note.title}"`,
// });

// In communities.routes.js  (after a join):
// await createNotification({
//   recipientId: community.ownerId,
//   actorId:     req.user.id,
//   type:        "COMMUNITY_JOIN",
//   entityId:    community.id,
//   entityType:  "community",
//   message:     `joined your community "${community.name}"`,
// });
