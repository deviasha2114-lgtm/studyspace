const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Fetch paginated messages for a community.
 * Uses cursor-based pagination on createdAt (stable, index-friendly).
 *
 * @param {string} communityId
 * @param {object} options - { cursor, limit, page }
 *   cursor  → ISO date string of last seen message (exclusive upper bound, older messages)
 *   page    → fallback offset-based page (if no cursor provided)
 *   limit   → number of messages to return
 */
const getMessages = async (communityId, { cursor, limit = 30, page = 1 } = {}) => {
  limit = Math.min(parseInt(limit, 10), 100); // cap at 100

  const where = {
    communityId,
    // We don't have a deletedAt field in our Message model, but we can add it if needed
    // For now, we'll assume all messages are active
  };

  // If cursor is provided, we want messages older than the cursor
  if (cursor) {
    where.createdAt = {
      lt: new Date(cursor)
    };
  }

  const messages = await prisma.message.findMany({
    where,
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          avatarUrl: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc' // newest first
    },
    take: limit + 1 // get one extra to check if there are more
  });

  // Check if there are more messages
  const hasMore = messages.length > limit;
  // If we have more, remove the extra one
  const data = hasMore ? messages.slice(0, -1) : messages;
  // Get the oldest message timestamp for next cursor
  const nextCursor = data.length > 0 ? data[data.length - 1].createdAt.toISOString() : null;

  return {
    messages: data.reverse(), // chronological order for the client
    nextCursor: nextCursor,
    hasMore: hasMore
  };
};

/**
 * Save a new message to the database.
 */
const saveMessage = async ({ communityId, senderId, content, type = 'text', attachments = [], replyTo = null }) => {
  const message = await prisma.message.create({
    data: {
      communityId,
      senderId,
      content,
      type,
      // Note: We don't have attachments or replyTo fields in our current Message model
      // These would need to be added to the schema if needed
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          avatarUrl: true
        }
      }
    }
  });

  return message;
};

module.exports = { getMessages, saveMessage };