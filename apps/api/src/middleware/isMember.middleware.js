const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * isMember middleware
 * Verifies that req.user is an active member of :communityId
 * Must be used AFTER authenticate middleware (req.user must exist)
 *
 * Usage:
 *   router.get('/:communityId/messages', authenticate, isMember, getMessages);
 */
const isMember = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { communityId } = req.params;

    if (!communityId) {
      return res.status(400).json({ error: 'communityId is required' });
    }

    // Check if user is a member of this community
    const membership = await prisma.communityMember.findFirst({
      where: {
        userId,
        communityId
      }
    });

    if (!membership) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not a member of this community',
      });
    }

    // Attach membership info for downstream use
    req.membership = membership;
    next();
  } catch (err) {
    console.error('isMember middleware error:', err);
    next(err);
  }
};

module.exports = { isMember };
